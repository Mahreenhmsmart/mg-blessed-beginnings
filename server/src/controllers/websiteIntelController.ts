/**
 * Website Intelligence Controller — Handles standalone website audit requests.
 * All methods are async and use try/catch with next(err).
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

// ─── In-memory store for demo (replace with DB in production) ─────────────

interface StoredAudit {
  auditId: string;
  userId: string;
  url: string;
  status: 'queued' | 'scanning' | 'complete' | 'error';
  progress: number;
  message: string;
  result?: Record<string, unknown>;
  createdAt: Date;
}

const auditStore = new Map<string, StoredAudit>();

// ─── URL Validation ───────────────────────────────────────────────────────

function normalizeUrl(input: string): { valid: boolean; url: string; error?: string } {
  let url = input.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'file:', 'data:', 'vbscript:'];
  const lowerUrl = url.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, url: '', error: 'Invalid URL protocol detected.' };
    }
  }
  
  // Add https:// if no protocol
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  
  try {
    const parsed = new URL(url);
    
    // Block localhost/private addresses
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || hostname.startsWith('10.') ||
        hostname.startsWith('172.16.')) {
      return { valid: false, url: '', error: 'Local addresses cannot be audited.' };
    }
    
    // Validate domain format
    if (!hostname.includes('.') || hostname.length < 3) {
      return { valid: false, url: '', error: 'Invalid domain format.' };
    }
    
    // Normalize to https
    parsed.protocol = 'https:';
    
    return { valid: true, url: parsed.toString().replace(/\/$/, '') };
  } catch {
    return { valid: false, url: '', error: 'Please enter a valid URL (e.g., example.com)' };
  }
}

// ─── Score Calculation Helpers ────────────────────────────────────────────

function getStatusFromScore(score: number): 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical' {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

function generateMockAuditResult(url: string) {
  const scores = {
    seo: { name: 'SEO Score', score: 78, maxScore: 100, status: getStatusFromScore(78), issues: { critical: 2, high: 5, medium: 12, low: 8 } },
    technical: { name: 'Technical Score', score: 82, maxScore: 100, status: getStatusFromScore(82), issues: { critical: 1, high: 3, medium: 8, low: 5 } },
    performance: { name: 'Performance Score', score: 65, maxScore: 100, status: getStatusFromScore(65), issues: { critical: 3, high: 4, medium: 6, low: 2 } },
    content: { name: 'Content Score', score: 71, maxScore: 100, status: getStatusFromScore(71), issues: { critical: 0, high: 4, medium: 9, low: 11 } },
    aeo: { name: 'AEO Score', score: 58, maxScore: 100, status: getStatusFromScore(58), issues: { critical: 2, high: 6, medium: 8, low: 4 } },
    security: { name: 'Security Score', score: 88, maxScore: 100, status: getStatusFromScore(88), issues: { critical: 0, high: 1, medium: 3, low: 2 } },
    mobile: { name: 'Mobile Score', score: 75, maxScore: 100, status: getStatusFromScore(75), issues: { critical: 1, high: 2, medium: 5, low: 7 } },
    schema: { name: 'Schema Score', score: 45, maxScore: 100, status: getStatusFromScore(45), issues: { critical: 4, high: 3, medium: 2, low: 1 } },
    internalLinks: { name: 'Internal Links', score: 68, maxScore: 100, status: getStatusFromScore(68), issues: { critical: 0, high: 5, medium: 7, low: 9 } },
  };

  const overallHealth = Math.round(
    Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.keys(scores).length
  );

  const findings = [
    {
      id: crypto.randomUUID(),
      severity: 'Critical',
      category: 'Technical SEO',
      url: `${url}/`,
      problem: 'Missing canonical tag on homepage',
      evidence: 'No <link rel="canonical"> tag found in page head',
      impact: 'Search engines may index duplicate versions of your pages, diluting ranking signals',
      solution: 'Add <link rel="canonical" href="' + url + '/" /> to the <head> section',
      priority: 95,
    },
    {
      id: crypto.randomUUID(),
      severity: 'Critical',
      category: 'Schema',
      url: `${url}/`,
      problem: 'No Organization schema markup detected',
      evidence: 'No JSON-LD or microdata schema found for Organization type',
      impact: 'Search engines cannot understand your business entity, reducing rich snippet eligibility',
      solution: 'Add Organization schema with name, logo, contact info, and social profiles',
      priority: 90,
    },
    {
      id: crypto.randomUUID(),
      severity: 'High',
      category: 'Performance',
      url: `${url}/`,
      problem: 'Large unoptimized images detected',
      evidence: 'Multiple images exceed 500KB without modern format compression',
      impact: 'Slower page load times affect user experience and Core Web Vitals scores',
      solution: 'Convert images to WebP/AVIF format and implement responsive image sizing',
      priority: 85,
    },
    {
      id: crypto.randomUUID(),
      severity: 'High',
      category: 'On-Page SEO',
      url: `${url}/about`,
      problem: 'Meta description too short',
      evidence: 'Meta description is 45 characters (recommended: 150-160)',
      impact: 'Reduced click-through rates from search results due to incomplete descriptions',
      solution: 'Expand meta description to 150-160 characters with compelling copy and keywords',
      priority: 80,
    },
    {
      id: crypto.randomUUID(),
      severity: 'Medium',
      category: 'Content',
      url: `${url}/services`,
      problem: 'Thin content on service pages',
      evidence: 'Service pages average 150 words (recommended: 500+ for competitive topics)',
      impact: 'Insufficient content depth may fail to rank for target keywords',
      solution: 'Expand service descriptions with detailed explanations, benefits, and FAQs',
      priority: 70,
    },
    {
      id: crypto.randomUUID(),
      severity: 'Medium',
      category: 'AEO',
      url: `${url}/`,
      problem: 'Missing FAQ section for common queries',
      evidence: 'No FAQ schema or question-based headings found on key pages',
      impact: 'Missed opportunities for featured snippets and AI-generated answers',
      solution: 'Add FAQ sections with schema markup addressing common customer questions',
      priority: 65,
    },
    {
      id: crypto.randomUUID(),
      severity: 'Low',
      category: 'Internal Links',
      url: `${url}/blog/post-1`,
      problem: 'Orphan page detected',
      evidence: 'Page has no incoming internal links from other site pages',
      impact: 'Search engines may have difficulty discovering and ranking this page',
      solution: 'Add contextual internal links from relevant pages to this content',
      priority: 50,
    },
    {
      id: crypto.randomUUID(),
      severity: 'Info',
      category: 'Security',
      url: `${url}/`,
      problem: 'HTTPS properly configured',
      evidence: 'Valid SSL certificate with strong cipher suites',
      impact: 'Site is secure and trusted by browsers and search engines',
      solution: 'Continue monitoring certificate expiration and security headers',
      priority: 10,
    },
  ];

  const recommendations = [
    { rank: 1, title: 'Fix missing canonical tags across all pages', impact: 'High', effort: 'Quick', priority: 'High' },
    { rank: 2, title: 'Implement Organization and LocalBusiness schema', impact: 'High', effort: 'Moderate', priority: 'High' },
    { rank: 3, title: 'Optimize and compress all images', impact: 'High', effort: 'Moderate', priority: 'High' },
    { rank: 4, title: 'Expand thin content on service pages', impact: 'Medium', effort: 'Extensive', priority: 'Medium' },
    { rank: 5, title: 'Add FAQ sections with schema markup', impact: 'Medium', effort: 'Moderate', priority: 'Medium' },
    { rank: 6, title: 'Improve internal linking structure', impact: 'Medium', effort: 'Moderate', priority: 'Medium' },
    { rank: 7, title: 'Optimize meta descriptions across all pages', impact: 'Medium', effort: 'Quick', priority: 'Low' },
    { rank: 8, title: 'Implement breadcrumb navigation with schema', impact: 'Low', effort: 'Quick', priority: 'Low' },
    { rank: 9, title: 'Add author information for E-E-A-T signals', impact: 'Medium', effort: 'Quick', priority: 'Medium' },
    { rank: 10, title: 'Create topic clusters for core service areas', impact: 'High', effort: 'Extensive', priority: 'Medium' },
  ];

  return {
    website: url,
    auditDate: new Date().toISOString(),
    overallHealth,
    scores,
    findings,
    recommendations,
    internalLinkMap: {
      pages: [],
      links: [],
      recommendations: [],
    },
    schemaItems: [],
    keywords: [],
    competitorAnalysis: null,
    backlinks: { providerConnected: false },
    securityCheck: {},
    performanceMetrics: {},
    mobileAudit: {},
    aeoAnalysis: { score: scores.aeo.score },
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────

export async function startAudit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url: inputUrl, targetCountry, targetLanguage, businessType, primaryKeyword, competitorUrls } = req.body;
    
    if (!inputUrl) {
      res.status(400).json({ success: false, error: 'URL is required.' });
      return;
    }

    const validation = normalizeUrl(inputUrl);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const auditId = crypto.randomUUID();
    const userId = req.user?.email || 'anonymous';

    // Store audit request
    auditStore.set(auditId, {
      auditId,
      userId,
      url: validation.url,
      status: 'queued',
      progress: 0,
      message: 'Audit queued for processing...',
      createdAt: new Date(),
    });

    // Simulate async processing (in production, use a job queue)
    setTimeout(async () => {
      const audit = auditStore.get(auditId);
      if (audit) {
        audit.status = 'scanning';
        audit.progress = 10;
        audit.message = 'Connecting to website...';
        
        // Simulate scan progress
        const steps = [
          { progress: 20, message: 'Analyzing site structure...' },
          { progress: 35, message: 'Checking technical SEO...' },
          { progress: 50, message: 'Analyzing on-page elements...' },
          { progress: 65, message: 'Evaluating content quality...' },
          { progress: 75, message: 'Testing performance metrics...' },
          { progress: 85, message: 'Checking mobile responsiveness...' },
          { progress: 90, message: 'Validating structured data...' },
          { progress: 95, message: 'Generating AI search readiness score...' },
          { progress: 100, message: 'Compiling final report...' },
        ];

        for (const step of steps) {
          await new Promise(resolve => setTimeout(resolve, 300));
          audit.progress = step.progress;
          audit.message = step.message;
        }

        // Complete audit
        audit.status = 'complete';
        audit.result = generateMockAuditResult(validation.url);
      }
    }, 500);

    res.status(201).json({ success: true, data: { auditId } });
  } catch (err) {
    next(err);
  }
}

export async function getAuditStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // Verify ownership
    const userId = req.user?.email || 'anonymous';
    if (audit.userId !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    res.json({
      success: true,
      data: {
        status: audit.status,
        progress: audit.progress,
        message: audit.message,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // Verify ownership
    const userId = req.user?.email || 'anonymous';
    if (audit.userId !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    if (audit.status !== 'complete') {
      res.status(400).json({ success: false, error: 'Audit not yet complete.' });
      return;
    }

    res.json({
      success: true,
      data: {
        auditId: audit.auditId,
        ...audit.result,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAudit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // Verify ownership
    const userId = req.user?.email || 'anonymous';
    if (audit.userId !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    auditStore.delete(auditId);
    res.json({ success: true, message: 'Audit deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function getAuditHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const url = req.query.url as string;
    const userId = req.user?.email || 'anonymous';

    const history: Array<{
      auditId: string;
      website: string;
      date: string;
      overallScore: number;
      criticalIssues: number;
      highIssues: number;
      status: 'completed' | 'failed';
    }> = [];

    for (const audit of auditStore.values()) {
      if (audit.userId === userId || req.user?.role === 'admin') {
        if (!url || audit.url.includes(url)) {
          const result = audit.result as Record<string, unknown> | undefined;
          const scores = result?.scores as Record<string, { issues: { critical: number; high: number } }> | undefined;
          
          history.push({
            auditId: audit.auditId,
            website: audit.url,
            date: audit.createdAt.toISOString(),
            overallScore: (result?.overallHealth as number) || 0,
            criticalIssues: Object.values(scores || {}).reduce((sum, s) => sum + (s.issues?.critical || 0), 0),
            highIssues: Object.values(scores || {}).reduce((sum, s) => sum + (s.issues?.high || 0), 0),
            status: audit.status === 'complete' ? 'completed' : 'failed',
          });
        }
      }
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function compareAudits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const beforeId = req.query.before as string;
    const afterId = req.query.after as string;

    if (!beforeId || !afterId) {
      res.status(400).json({ success: false, error: 'Both before and after audit IDs are required.' });
      return;
    }

    const beforeAudit = auditStore.get(beforeId);
    const afterAudit = auditStore.get(afterId);

    if (!beforeAudit || !afterAudit) {
      res.status(404).json({ success: false, error: 'One or both audits not found.' });
      return;
    }

    // Verify ownership
    const userId = req.user?.email || 'anonymous';
    if ((beforeAudit.userId !== userId || afterAudit.userId !== userId) && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    const beforeResult = beforeAudit.result as Record<string, unknown> | undefined;
    const afterResult = afterAudit.result as Record<string, unknown> | undefined;
    const beforeScores = beforeResult?.scores as Record<string, { score: number }> | undefined;
    const afterScores = afterResult?.scores as Record<string, { score: number }> | undefined;

    // Calculate score changes
    const scoreChanges: Record<string, { before: number; after: number; delta: number }> = {};
    const allKeys = new Set([...Object.keys(beforeScores || {}), ...Object.keys(afterScores || {})]);
    
    for (const key of allKeys) {
      const beforeScore = beforeScores?.[key]?.score || 0;
      const afterScore = afterScores?.[key]?.score || 0;
      scoreChanges[key] = {
        before: beforeScore,
        after: afterScore,
        delta: afterScore - beforeScore,
      };
    }

    res.json({
      success: true,
      data: {
        before: {
          auditId: beforeId,
          date: beforeAudit.createdAt.toISOString(),
          scores: Object.fromEntries(Object.entries(beforeScores || {}).map(([k, v]) => [k, v.score])),
          criticalCount: 0,
          highCount: 0,
        },
        after: {
          auditId: afterId,
          date: afterAudit.createdAt.toISOString(),
          scores: Object.fromEntries(Object.entries(afterScores || {}).map(([k, v]) => [k, v.score])),
          criticalCount: 0,
          highCount: 0,
        },
        changes: {
          scoreChanges,
          newIssues: [],
          resolvedIssues: [],
          remainingIssues: [],
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function generateFix(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId, findingId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // Generate fix code based on finding type
    const fixCode = `<!-- Fix for finding ${findingId} -->\n<!-- Add this to your HTML <head> section -->`;

    res.json({ success: true, data: { fixCode } });
  } catch (err) {
    next(err);
  }
}

export async function resolveFinding(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId, findingId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // In production, update the finding status in the database
    res.json({ success: true, message: 'Finding marked as resolved.' });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const format = req.query.format as string || 'pdf';

    const audit = auditStore.get(auditId);
    if (!audit || audit.status !== 'complete') {
      res.status(404).json({ success: false, error: 'Audit not found or not complete.' });
      return;
    }

    // Generate report content based on format
    if (format === 'csv') {
      const csvContent = 'Category,Issue,Severity,Status\n' + 
        'Technical SEO,Missing canonical,Critical,Open\n';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-${auditId}.csv"`);
      res.send(csvContent);
    } else if (format === 'markdown') {
      const mdContent = `# Website Audit Report\n\n**Website:** ${audit.url}\n**Date:** ${audit.createdAt.toISOString()}\n`;
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="audit-${auditId}.md"`);
      res.send(mdContent);
    } else {
      // PDF would require a library like pdfkit
      res.status(501).json({ success: false, error: 'PDF export not yet implemented.' });
    }
  } catch (err) {
    next(err);
  }
}

export async function checkProviders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Check which data providers are configured
    const providers = {
      keywordProvider: !!process.env.KEYWORD_API_KEY,
      backlinkProvider: !!process.env.BACKLINK_API_KEY,
      searchConsole: !!process.env.GSC_CLIENT_ID,
      performanceApi: !!process.env.PAGESPEED_API_KEY,
    };

    res.json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
}

export async function getKeywordSuggestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const audit = auditStore.get(auditId);

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    // Return AI-generated suggestions (not real search volume data)
    const suggestions = [
      {
        keyword: 'digital marketing services',
        searchVolume: null,
        intent: 'Commercial',
        difficulty: 65,
        currentPosition: null,
        opportunity: 75,
        recommendedPage: '/services',
        isAISuggestion: true,
      },
      {
        keyword: 'seo audit tool',
        searchVolume: null,
        intent: 'Transactional',
        difficulty: 72,
        currentPosition: null,
        opportunity: 60,
        recommendedPage: '/tools/seo-audit',
        isAISuggestion: true,
      },
    ];

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
}

export async function analyzeCompetitors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId } = req.params;
    const { competitors } = req.body;

    const audit = auditStore.get(auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      res.status(400).json({ success: false, error: 'Competitor URLs are required.' });
      return;
    }

    if (competitors.length > 5) {
      res.status(400).json({ success: false, error: 'Maximum 5 competitors allowed.' });
      return;
    }

    // Validate each competitor URL
    for (const url of competitors) {
      const validation = normalizeUrl(url);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: `Invalid competitor URL: ${url}` });
        return;
      }
    }

    // Return mock competitor analysis
    const analysis = {
      you: {
        url: audit.url,
        strengths: ['Strong technical SEO foundation', 'Good mobile responsiveness'],
        weaknesses: ['Limited schema markup', 'Thin content on some pages'],
      },
      competitors: competitors.map((url: string) => ({
        url,
        siteStructure: { pageCount: 50, categories: ['Services', 'Blog', 'About'] },
        titlePatterns: ['{Service} in {Location}', '{Topic} Guide'],
        headings: ['Professional Services', 'Expert Solutions'],
        contentTopics: ['digital marketing', 'seo services'],
        schemaTypes: ['Organization', 'LocalBusiness', 'Service'],
        internalLinkCount: 150,
        services: ['SEO', 'PPC', 'Content Marketing'],
        scores: { seo: 75, performance: 70, content: 80 },
      })),
      gaps: {
        whereCompetitorsStronger: ['More comprehensive service pages', 'Better FAQ coverage'],
        whereYouAreStronger: ['Faster page load times', 'Cleaner site structure'],
        opportunitiesMissing: ['Video content integration', 'Case study pages'],
      },
    };

    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}
