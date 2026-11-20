/**
 * Google Search Console Service — OAuth2 flow and data import.
 * Handles GSC authentication and fetches search analytics data.
 */

import mongoose from 'mongoose';
import GSCConnection from '../models/GSCConnection';
import Project from '../models/Project';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GSC_API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const GSC_INSPECTION_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const GSC_SITEMAPS_API = 'https://www.googleapis.com/webmasters/v3';

// ─── URL Validation Helpers ──────────────────────────────────────────────

/**
 * Validate that a string is a well-formed http(s) URL.
 */
function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check whether `targetUrl` falls within the scope of `propertyUrl`.
 * Supports both domain properties (sc-domain:example.com) and URL-prefix
 * properties (https://example.com).
 */
function isUrlWithinProperty(targetUrl: string, propertyUrl: string): boolean {
  // Domain property: sc-domain:example.com — any subdomain/path is valid
  if (propertyUrl.startsWith('sc-domain:')) {
    const domain = propertyUrl.replace('sc-domain:', '');
    try {
      const hostname = new URL(targetUrl).hostname;
      return hostname === domain || hostname.endsWith(`.${domain}`);
    } catch {
      return false;
    }
  }

  // URL-prefix property: must share the same origin + path prefix
  try {
    const propParsed = new URL(propertyUrl);
    const targetParsed = new URL(targetUrl);
    return (
      targetParsed.origin === propParsed.origin &&
      targetParsed.pathname.startsWith(propParsed.pathname)
    );
  } catch {
    return false;
  }
}

function getGSCConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GSC_REDIRECT_URI || '',
  };
}

function isConfigured(): boolean {
  const config = getGSCConfig();
  return Boolean(config.clientId && config.clientSecret && config.redirectUri);
}

/**
 * Generate the Google OAuth2 authorization URL.
 * Requests webmasters.readonly + webmasters scopes for full property/sitemap access.
 */
export function getAuthUrl(projectId: string): string {
  if (!isConfigured()) {
    throw new Error('Google Search Console credentials are not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GSC_REDIRECT_URI in environment variables.');
  }

  const config = getGSCConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    state: projectId,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCode(code: string, projectId: string): Promise<void> {
  if (!isConfigured()) {
    throw new Error('Google Search Console credentials are not configured.');
  }

  const config = getGSCConfig();

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json() as Record<string, any>;

  const pid = new mongoose.Types.ObjectId(projectId);
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  // Upsert the connection
  await GSCConnection.findOneAndUpdate(
    { projectId: pid },
    {
      $set: {
        projectId: pid,
        accessToken: data.access_token as string,
        refreshToken: data.refresh_token as string,
        expiresAt: new Date(Date.now() + ((data.expires_in as number) || 3600) * 1000),
        siteUrl: project.url,
        connectedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );
}

/**
 * Refresh an expired access token.
 */
async function refreshAccessToken(connection: any): Promise<string> {
  const config = getGSCConfig();

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!res.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await res.json() as Record<string, any>;

  // Update stored token
  connection.accessToken = data.access_token;
  connection.expiresAt = new Date(Date.now() + ((data.expires_in as number) || 3600) * 1000);
  await connection.save();

  return data.access_token as string;
}

/**
 * Get a valid access token, refreshing if needed.
 */
async function getValidToken(projectId: string): Promise<{ token: string; siteUrl: string }> {
  const pid = new mongoose.Types.ObjectId(projectId);
  const connection = await GSCConnection.findOne({ projectId: pid });

  if (!connection) {
    throw new Error('Google Search Console is not connected for this project.');
  }

  let token = connection.accessToken;
  if (new Date() >= connection.expiresAt) {
    token = await refreshAccessToken(connection);
  }

  return { token, siteUrl: connection.siteUrl };
}

/**
 * Fetch search analytics data from GSC.
 */
export async function fetchSearchAnalytics(
  projectId: string,
  startDate: string,
  endDate: string,
): Promise<any> {
  if (!isConfigured()) {
    return { configured: false, message: 'Google Search Console credentials are not configured.' };
  }

  const { token, siteUrl } = await getValidToken(projectId);

  const encodedSite = encodeURIComponent(siteUrl);
  const url = `${GSC_API_BASE}/sites/${encodedSite}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 90,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC API error: ${err}`);
  }

  const data = await res.json() as Record<string, any>;

  // Aggregate metrics
  const rows: Array<Record<string, any>> = data.rows || [];
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalCtr = 0;
  let totalPosition = 0;

  for (const row of rows) {
    totalClicks += row.clicks || 0;
    totalImpressions += row.impressions || 0;
    totalCtr += row.ctr || 0;
    totalPosition += row.position || 0;
  }

  const avgCtr = rows.length > 0 ? (totalCtr / rows.length) * 100 : 0;
  const avgPosition = rows.length > 0 ? totalPosition / rows.length : 0;

  return {
    configured: true,
    period: { startDate, endDate },
    summary: {
      totalClicks,
      totalImpressions,
      avgCtr: Math.round(avgCtr * 100) / 100,
      avgPosition: Math.round(avgPosition * 10) / 10,
    },
    dailyData: rows.map((r: any) => ({
      date: r.keys?.[0] || '',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: Math.round((r.ctr || 0) * 10000) / 100,
      position: Math.round((r.position || 0) * 10) / 10,
    })),
  };
}

/**
 * Check if GSC is configured at all.
 */
export function checkConfiguration(): { configured: boolean; message: string } {
  if (isConfigured()) {
    return { configured: true, message: 'Google Search Console integration is available.' };
  }
  return {
    configured: false,
    message: 'Google Search Console credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GSC_REDIRECT_URI) are not configured.',
  };
}

// ─── Extended GSC Functions ──────────────────────────────────────────────

/**
 * List all verified properties the connected Google account has access to.
 */
export async function listProperties(projectId: string): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  const { token } = await getValidToken(projectId);

  const url = `${GSC_API_BASE}/sites`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC sites.list error: ${err}`);
  }

  const data = await res.json() as Record<string, any>;
  const sites: Array<Record<string, any>> = data.siteEntry || [];

  return sites.map((site) => ({
    siteUrl: site.siteUrl || '',
    permissionLevel: site.permissionLevel || 'unknown',
  }));
}

/**
 * Generalized search analytics query by arbitrary dimensions.
 */
export async function fetchSearchAnalyticsByDimension(
  projectId: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  filters?: Array<{ dimension: string; operator: string; expression: string }>,
  rowLimit = 1000,
): Promise<any> {
  const { token, siteUrl } = await getValidToken(projectId);

  const encodedSite = encodeURIComponent(siteUrl);
  const url = `${GSC_API_BASE}/sites/${encodedSite}/searchAnalytics/query`;

  const body: Record<string, any> = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
  };

  if (filters && filters.length > 0) {
    body.dimensionFilterGroups = [{ filters }];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC searchAnalytics error: ${err}`);
  }

  const data = await res.json() as Record<string, any>;
  const rows: Array<Record<string, any>> = data.rows || [];

  // Build structured response based on dimensions
  const result = rows.map((row: any) => {
    const keys: Record<string, string> = {};
    if (row.keys) {
      dimensions.forEach((dim, i) => {
        keys[dim] = row.keys[i] || '';
      });
    }
    return {
      keys,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 10000) / 100,
      position: Math.round((row.position || 0) * 10) / 10,
    };
  });

  return {
    rows: result,
    totalRows: rows.length,
  };
}

/**
 * Fetch top search queries sorted by clicks.
 */
export async function fetchTopQueries(
  projectId: string,
  startDate: string,
  endDate: string,
  limit = 25,
): Promise<any> {
  const result = await fetchSearchAnalyticsByDimension(
    projectId,
    startDate,
    endDate,
    ['query'],
    undefined,
    limit,
  );

  // Sort by clicks descending
  result.rows.sort((a: any, b: any) => b.clicks - a.clicks);
  return result;
}

/**
 * Fetch top pages sorted by clicks.
 */
export async function fetchTopPages(
  projectId: string,
  startDate: string,
  endDate: string,
  limit = 25,
): Promise<any> {
  const result = await fetchSearchAnalyticsByDimension(
    projectId,
    startDate,
    endDate,
    ['page'],
    undefined,
    limit,
  );

  result.rows.sort((a: any, b: any) => b.clicks - a.clicks);
  return result;
}

/**
 * Fetch country breakdown.
 */
export async function fetchCountryBreakdown(
  projectId: string,
  startDate: string,
  endDate: string,
): Promise<any> {
  const result = await fetchSearchAnalyticsByDimension(
    projectId,
    startDate,
    endDate,
    ['country'],
    undefined,
    50,
  );

  result.rows.sort((a: any, b: any) => b.clicks - a.clicks);
  return result;
}

/**
 * Fetch device breakdown.
 */
export async function fetchDeviceBreakdown(
  projectId: string,
  startDate: string,
  endDate: string,
): Promise<any> {
  const result = await fetchSearchAnalyticsByDimension(
    projectId,
    startDate,
    endDate,
    ['device'],
    undefined,
    10,
  );

  result.rows.sort((a: any, b: any) => b.clicks - a.clicks);
  return result;
}

/**
 * Inspect a specific URL for indexability status.
 * Validates that the inspected URL is within the connected property's scope (H-2 fix).
 */
export async function inspectUrl(
  projectId: string,
  inspectionUrl: string,
): Promise<any> {
  const { token, siteUrl } = await getValidToken(projectId);

  // Validate the URL uses http(s) protocol
  if (!isValidHttpUrl(inspectionUrl)) {
    throw new Error('inspectionUrl must be a valid http or https URL.');
  }

  // Ensure the inspected URL belongs to the connected property
  if (!isUrlWithinProperty(inspectionUrl, siteUrl)) {
    throw new Error('The inspected URL does not belong to the connected property.');
  }

  const res = await fetch(GSC_INSPECTION_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inspectionUrl,
      siteUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC URL Inspection error: ${err}`);
  }

  const data = await res.json() as Record<string, any>;
  const result = data.inspectionResult || {};

  return {
    indexStatusResult: result.indexStatusResult || null,
    mobileUsabilityResult: result.mobileUsabilityResult || null,
    richResultsResult: result.richResultsResult || null,
    ampResult: result.ampResult || null,
  };
}

/**
 * List sitemaps for a property.
 * Always uses the siteUrl stored on the GSCConnection document — client-supplied
 * overrides are intentionally ignored to prevent cross-property access (H-3 fix).
 */
export async function listSitemaps(
  projectId: string,
): Promise<any> {
  const { token, siteUrl } = await getValidToken(projectId);

  const encodedSite = encodeURIComponent(siteUrl);
  const url = `${GSC_SITEMAPS_API}/sites/${encodedSite}/sitemaps`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC sitemaps.list error: ${err}`);
  }

  const data = await res.json() as Record<string, any>;
  const sitemaps: Array<Record<string, any>> = data.sitemap || [];

  return sitemaps.map((sm) => ({
    path: sm.path || '',
    lastSubmitted: sm.lastSubmitted || null,
    isPending: sm.isPending || false,
    warnings: sm.warnings || '0',
    errors: sm.errors || '0',
    contents: sm.contents || [],
  }));
}

/**
 * Submit a sitemap for a property.
 * Validates that the siteUrl matches the connected property's domain (H-1 fix).
 */
export async function submitSitemap(
  projectId: string,
  siteUrl: string,
  feedpath: string,
): Promise<void> {
  const { token, siteUrl: connSiteUrl } = await getValidToken(projectId);

  // Validate URLs use http(s) protocol
  if (!isValidHttpUrl(siteUrl)) {
    throw new Error('siteUrl must be a valid http or https URL.');
  }
  if (!isValidHttpUrl(feedpath)) {
    throw new Error('feedpath must be a valid http or https URL.');
  }

  // Ensure the submitted sitemap target is within the connected property's scope
  if (!isUrlWithinProperty(siteUrl, connSiteUrl)) {
    throw new Error('The sitemap target does not belong to the connected property.');
  }

  const encodedSite = encodeURIComponent(siteUrl);
  const encodedFeed = encodeURIComponent(feedpath);
  const url = `${GSC_SITEMAPS_API}/sites/${encodedSite}/sitemaps/${encodedFeed}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC sitemap submit error: ${err}`);
  }
}

/**
 * Disconnect GSC — delete the connection document.
 * Verifies that the user owns the project before deleting (C-4 fix).
 */
export async function disconnectGSC(projectId: string, userId: string): Promise<void> {
  const pid = new mongoose.Types.ObjectId(projectId);

  // Verify the user owns the project
  const project = await Project.findOne({ _id: pid, userId });
  if (!project) {
    throw new Error('Project not found.');
  }

  await GSCConnection.deleteOne({ projectId: pid });
}
