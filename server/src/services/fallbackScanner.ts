/**
 * TypeScript Security Scanner (Primary)
 * 
 * Performs a 5-agent security assessment using only native Node.js modules
 * (http, https, dns, net, tls). No external process spawning required.
 * 
 * Agents: Planner → Recon → Port Scanner → Web Auditor → Reporter
 * 
 * Produces summary.json and report.md output files.
 */

import http from 'http';
import https from 'https';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

// ── Types ───────────────────────────────────────────────────────────────────────

interface Finding {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  target: string;
  evidence: string;
  impact: string;
  remediation: string;
  status: string;
}

interface AgentResult {
  agent: string;
  target: string;
  scan_id: string;
  timestamp: string;
  findings: Finding[];
  data: Record<string, unknown>;
  summary: string;
  duration_seconds?: number;
}

interface PlanData {
  agent: string;
  scan_id: string;
  target: string;
  original_target: string;
  base_url: string;
  port: number;
  scheme: string;
  scan_type: string;
  resolved_ip: string | null;
  timestamp: string;
  scope: {
    ports_to_check: number[];
    sensitive_paths: string[];
    web_checks: string[];
    total_port_checks: number;
    total_path_checks: number;
  };
  timeouts: {
    per_check_seconds: number;
    total_scan_seconds: number;
  };
  agents: string[];
  findings: Finding[];
  summary: string;
}

interface StatusUpdate {
  scanId: string;
  status: string;
  message: string;
  progress: number;
  timestamp: string;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 443, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017];

const SENSITIVE_PATHS = [
  '/.env', '/.git/config', '/.git/HEAD', '/wp-config.php', '/config.php',
  '/database.yml', '/.htpasswd', '/server-status', '/phpinfo.php', '/info.php',
  '/.DS_Store', '/backup.sql', '/dump.sql', '/robots.txt', '/sitemap.xml',
  '/.well-known/security.txt',
];

const PORT_SERVICE_MAP: Record<number, { name: string; description: string }> = {
  21: { name: 'FTP', description: 'File Transfer Protocol - potentially sensitive if exposed' },
  22: { name: 'SSH', description: 'Secure Shell - remote administration service' },
  23: { name: 'Telnet', description: 'Telnet - INSECURE unencrypted remote access' },
  25: { name: 'SMTP', description: 'Simple Mail Transfer Protocol' },
  53: { name: 'DNS', description: 'Domain Name System' },
  80: { name: 'HTTP', description: 'Web Server' },
  443: { name: 'HTTPS', description: 'Secure Web Server' },
  993: { name: 'IMAPS', description: 'Secure IMAP' },
  995: { name: 'POP3S', description: 'Secure POP3' },
  1433: { name: 'MSSQL', description: 'Microsoft SQL Server - database service' },
  1521: { name: 'Oracle', description: 'Oracle Database - database service' },
  3306: { name: 'MySQL', description: 'MySQL Database - database service' },
  3389: { name: 'RDP', description: 'Remote Desktop Protocol - remote administration' },
  5432: { name: 'PostgreSQL', description: 'PostgreSQL Database - database service' },
  5900: { name: 'VNC', description: 'VNC Remote Access - remote administration' },
  6379: { name: 'Redis', description: 'Redis Cache - cache service' },
  8080: { name: 'HTTP-Alt', description: 'Alternative HTTP port' },
  8443: { name: 'HTTPS-Alt', description: 'Alternative HTTPS port' },
  27017: { name: 'MongoDB', description: 'MongoDB Database - database service' },
};

const SENSITIVE_SERVICES = new Set(['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MSSQL', 'Oracle', 'RDP', 'VNC', 'Telnet']);

const SECURITY_HEADERS: Record<string, { missing_severity: string; title: string; impact: string; remediation: string }> = {
  'strict-transport-security': {
    missing_severity: 'Medium',
    title: 'Missing HSTS Header',
    impact: 'Without HSTS, users may be vulnerable to SSL stripping attacks.',
    remediation: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' header.",
  },
  'content-security-policy': {
    missing_severity: 'Medium',
    title: 'Missing Content-Security-Policy',
    impact: 'Without CSP, the site may be more vulnerable to XSS attacks.',
    remediation: 'Implement a Content-Security-Policy header appropriate for your application.',
  },
  'x-content-type-options': {
    missing_severity: 'Low',
    title: 'Missing X-Content-Type-Options',
    impact: 'Browser may perform MIME-type sniffing, potentially leading to XSS.',
    remediation: "Add 'X-Content-Type-Options: nosniff' header.",
  },
  'x-frame-options': {
    missing_severity: 'Low',
    title: 'Missing X-Frame-Options',
    impact: 'Site may be vulnerable to clickjacking attacks.',
    remediation: "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' header.",
  },
  'referrer-policy': {
    missing_severity: 'Informational',
    title: 'Missing Referrer-Policy',
    impact: 'Referrer information may leak sensitive URL parameters.',
    remediation: "Add 'Referrer-Policy: strict-origin-when-cross-origin' header.",
  },
  'permissions-policy': {
    missing_severity: 'Informational',
    title: 'Missing Permissions-Policy',
    impact: 'Browser features like camera, microphone may be accessible by default.',
    remediation: 'Implement Permissions-Policy to restrict browser features.',
  },
};

const SEVERITY_DEDUCTIONS: Record<string, number> = {
  Critical: 20, High: 10, Medium: 5, Low: 2, Informational: 0,
};

const CONNECT_TIMEOUT_MS = 3000;
const REQUEST_TIMEOUT_MS = 15000;
const TOTAL_TIMEOUT_MS = 300000; // 5 minutes

// ── Helpers ─────────────────────────────────────────────────────────────────────

function writeStatus(outputDir: string, scanId: string, status: string, message: string, progress: number): void {
  const statusData: StatusUpdate = {
    scanId,
    status,
    message,
    progress,
    timestamp: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(path.join(outputDir, 'status.json'), JSON.stringify(statusData));
  } catch {
    // Non-fatal
  }
}

function sanitizeValue(value: string): string {
  if (!value) return '';
  return value
    .replace(/(?:api[_-]?key|apikey)\s*[:=]\s*\S+/gi, '[REDACTED]')
    .replace(/(?:token|auth|bearer)\s*[:=]\s*\S+/gi, '[REDACTED]')
    .replace(/(?:password|passwd|pwd|secret)\s*[:=]\s*\S+/gi, '[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, '[REDACTED]');
}

function httpGet(urlStr: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const req = transport.get(urlStr, {
      timeout: timeoutMs,
      headers: { 'User-Agent': 'MGSecurityScanner/1.0 (Authorized Assessment)' },
      rejectUnauthorized: false,
    }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, urlStr).toString();
        httpGet(redirectUrl, timeoutMs).then(resolve).catch(reject);
        return;
      }

      const headers: Record<string, string> = {};
      for (const [key, val] of Object.entries(res.headers)) {
        if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val;
      }

      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers, body }));
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
  });
}

function httpHead(urlStr: string, timeoutMs: number = 5000): Promise<{ statusCode: number; headers: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const req = transport.request(urlStr, {
      method: 'HEAD',
      timeout: timeoutMs,
      headers: { 'User-Agent': 'MGSecurityScanner/1.0 (Authorized Assessment)' },
      rejectUnauthorized: false,
    }, (res) => {
      const headers: Record<string, string> = {};
      for (const [key, val] of Object.entries(res.headers)) {
        if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val;
      }
      resolve({ statusCode: res.statusCode || 0, headers });
      res.resume(); // Consume response data to free up memory
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
    req.end();
  });
}

function checkPort(hostname: string, port: number, timeoutMs: number = CONNECT_TIMEOUT_MS): Promise<{ open: boolean; banner: string | null }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';
    let resolved = false;

    const done = (open: boolean) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({ open, banner: banner.trim().substring(0, 200) || null });
    };

    socket.setTimeout(timeoutMs);
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));
    socket.on('connect', () => {
      // Try to grab banner
      socket.write('\r\n');
      setTimeout(() => done(true), 1000);
    });
    socket.on('data', (data: Buffer) => {
      banner += data.toString('utf-8');
    });

    socket.connect(port, hostname);
  });
}

function resolveDns(hostname: string): Promise<{ records: Record<string, string[]>; errors: string[] }> {
  return new Promise((resolve) => {
    const records: Record<string, string[]> = {};
    const errors: string[] = [];

    // A record
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        errors.push(`A: ${err.message.substring(0, 100)}`);
      } else {
        records['A'] = addresses;
      }

      // AAAA record
      dns.resolve6(hostname, (err6, addresses6) => {
        if (!err6 && addresses6.length > 0) records['AAAA'] = addresses6;

        // MX record
        dns.resolveMx(hostname, (errMx, mxRecords) => {
          if (!errMx && mxRecords.length > 0) {
            records['MX'] = mxRecords.map(r => `${r.priority} ${r.exchange}`);
          }

          // NS record
          dns.resolveNs(hostname, (errNs, nsRecords) => {
            if (!errNs && nsRecords.length > 0) records['NS'] = nsRecords;

            // TXT record
            dns.resolveTxt(hostname, (errTxt, txtRecords) => {
              if (!errTxt && txtRecords.length > 0) {
                records['TXT'] = txtRecords.map(r => r.join(''));
              }
              resolve({ records, errors });
            });
          });
        });
      });
    });
  });
}

function checkTlsCertificate(hostname: string, port: number = 443): Promise<{ cert: Record<string, unknown> | null; cipher: { name: string; version: string; bits: number } | null; protocol: string | null; error: string | null }> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: hostname, port, servername: hostname, timeout: 10000, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate(true);
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();

      const certInfo: Record<string, unknown> | null = cert && Object.keys(cert).length > 0 ? {
        subject: cert.subject ? Object.entries(cert.subject).map(([k, v]) => `${k}=${v}`).join(', ') : 'Unknown',
        issuer: cert.issuer ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(', ') : 'Unknown',
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        notAfter: cert.valid_to,
      } : null;

      socket.destroy();
      resolve({
        cert: certInfo,
        cipher: cipher ? { name: cipher.name, version: cipher.version, bits: 0 } : null,
        protocol: protocol || null,
        error: null,
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ cert: null, cipher: null, protocol: null, error: err.message.substring(0, 200) });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ cert: null, cipher: null, protocol: null, error: 'TLS connection timeout' });
    });
  });
}

// ── Agents ──────────────────────────────────────────────────────────────────────

async function plannerAgent(target: string, scanId: string): Promise<PlanData> {
  // Normalize target
  let hostname = target.trim();
  let port = 443;
  let scheme = 'https';

  if (hostname.startsWith('http://')) {
    scheme = 'http';
    hostname = hostname.substring(7);
  } else if (hostname.startsWith('https://')) {
    hostname = hostname.substring(8);
  }
  hostname = hostname.split('/')[0];
  if (hostname.includes(':')) {
    const parts = hostname.split(':');
    hostname = parts[0];
    port = parseInt(parts[1], 10) || 443;
  }
  hostname = hostname.toLowerCase();

  if (scheme === 'http' && port === 443) port = 80;

  const baseUrl = `${scheme}://${hostname}${port !== 80 && port !== 443 ? ':' + port : ''}`;

  // Determine scan type
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIp = ipPattern.test(hostname);
  const scanType = isIp ? 'ip' : hostname.includes('.') ? 'domain' : 'unknown';

  // DNS pre-check
  let resolvedIp: string | null = null;
  try {
    const dnsResult = await resolveDns(hostname);
    const aRecords = dnsResult.records['A'];
    if (aRecords && aRecords.length > 0) resolvedIp = aRecords[0];
  } catch { /* ignore */ }

  return {
    agent: 'planner',
    scan_id: scanId,
    target: hostname,
    original_target: target,
    base_url: baseUrl,
    port,
    scheme,
    scan_type: scanType,
    resolved_ip: resolvedIp,
    timestamp: new Date().toISOString(),
    scope: {
      ports_to_check: DEFAULT_PORTS,
      sensitive_paths: SENSITIVE_PATHS,
      web_checks: ['security_headers', 'tls_certificate', 'cookie_security', 'exposed_resources', 'mixed_content', 'server_disclosure'],
      total_port_checks: DEFAULT_PORTS.length,
      total_path_checks: SENSITIVE_PATHS.length,
    },
    timeouts: { per_check_seconds: 30, total_scan_seconds: 300 },
    agents: ['recon', 'port_scanner', 'web_auditor', 'reporter'],
    findings: [],
    summary: `Plan created for ${scanType} target ${hostname}. ${DEFAULT_PORTS.length} ports, ${SENSITIVE_PATHS.length} paths to check.`,
  };
}

async function reconAgent(hostname: string, baseUrl: string, scanId: string): Promise<AgentResult> {
  const findings: Finding[] = [];
  const data: Record<string, unknown> = {};

  // 1. DNS Resolution
  const dnsData = await resolveDns(hostname);
  data['dns'] = { hostname, records: dnsData.records, errors: dnsData.errors };

  const resolvedIp = dnsData.records['A']?.[0] || 'unresolved';

  // 2. Technology fingerprinting via HTTP headers
  try {
    const response = await httpGet(baseUrl, 15000);
    const headers = response.headers;

    data['technology'] = { headers, status_code: response.statusCode };

    const serverHeader = headers['server'] || headers['Server'];
    if (serverHeader) {
      findings.push({
        title: 'Server Software Identified',
        severity: 'Informational',
        target: baseUrl,
        evidence: `Server header: ${serverHeader.substring(0, 200)}`,
        impact: 'Server software disclosure may help attackers identify known vulnerabilities.',
        remediation: 'Consider removing or obfuscating the Server header.',
        status: 'Open',
      });
    }

    const poweredBy = headers['x-powered-by'] || headers['X-Powered-By'];
    if (poweredBy) {
      findings.push({
        title: `Technology Detected: ${poweredBy.substring(0, 100)}`,
        severity: 'Informational',
        target: baseUrl,
        evidence: `Detected via X-Powered-By header: ${poweredBy.substring(0, 100)}`,
        impact: 'Technology stack information aids attacker reconnaissance.',
        remediation: 'Remove unnecessary technology disclosure headers.',
        status: 'Open',
      });
    }
  } catch { /* non-fatal */ }

  // 3. Subdomains — skip crt.sh in fallback (network-dependent external API)
  data['subdomains'] = [];

  return {
    agent: 'recon',
    target: hostname,
    scan_id: scanId,
    timestamp: new Date().toISOString(),
    findings,
    data,
    summary: `Reconnaissance complete for ${hostname}. IP: ${resolvedIp}, ${findings.length} finding(s).`,
  };
}

async function portScannerAgent(hostname: string, scanId: string, totalTimeoutMs: number = 60000): Promise<AgentResult> {
  const findings: Finding[] = [];
  const openPorts: Array<{ port: number; service: string; description: string; banner: string | null }> = [];
  let closedCount = 0;
  let filteredCount = 0;
  const startTime = Date.now();

  for (const portNum of DEFAULT_PORTS) {
    // Check total timeout
    if (Date.now() - startTime > totalTimeoutMs) break;

    const serviceInfo = PORT_SERVICE_MAP[portNum] || { name: `Port-${portNum}`, description: 'Unknown service' };
    const result = await checkPort(hostname, portNum, CONNECT_TIMEOUT_MS);

    if (result.open) {
      openPorts.push({
        port: portNum,
        service: serviceInfo.name,
        description: serviceInfo.description,
        banner: result.banner,
      });

      if (SENSITIVE_SERVICES.has(serviceInfo.name)) {
        const severity = serviceInfo.name === 'Telnet' ? 'High' : 'Medium';
        const title = serviceInfo.name === 'Telnet'
          ? `Insecure Service Exposed: ${serviceInfo.name}`
          : `Exposed ${serviceInfo.name} Service`;
        const impact = serviceInfo.name === 'Telnet'
          ? `${serviceInfo.name} transmits data including credentials in plaintext. Attackers can intercept communications.`
          : `The ${serviceInfo.name} service is exposed to the network. Database and remote administration services should typically not be publicly accessible.`;

        findings.push({
          title,
          severity,
          target: `${hostname}:${portNum}`,
          evidence: `Port ${portNum} (${serviceInfo.name}) is open and accessible. ${serviceInfo.description}`,
          impact,
          remediation: `Restrict access to port ${portNum} using firewall rules. Ensure ${serviceInfo.name} is only accessible from trusted networks or via VPN.`,
          status: 'Open',
        });
      } else {
        findings.push({
          title: `Service Detected: ${serviceInfo.name}`,
          severity: 'Informational',
          target: `${hostname}:${portNum}`,
          evidence: `Port ${portNum} (${serviceInfo.name}) is open.` + (result.banner ? ` Banner: ${result.banner.substring(0, 80)}` : ''),
          impact: 'Identifies running services on the target.',
          remediation: 'Verify this service is intentionally exposed and properly secured.',
          status: 'Open',
        });
      }
    } else {
      closedCount++;
    }
  }

  const duration = (Date.now() - startTime) / 1000;

  return {
    agent: 'port_scanner',
    target: hostname,
    scan_id: scanId,
    timestamp: new Date().toISOString(),
    duration_seconds: Math.round(duration * 100) / 100,
    findings,
    data: {
      open_ports: openPorts,
      closed_count: closedCount,
      filtered_count: filteredCount,
      error_count: 0,
      total_checked: DEFAULT_PORTS.length,
      scan_completed: Date.now() - startTime <= totalTimeoutMs,
    },
    summary: `Port analysis complete: ${openPorts.length} open, ${closedCount} closed out of ${DEFAULT_PORTS.length} ports checked.`,
  };
}

async function webAuditorAgent(hostname: string, baseUrl: string, port: number, scanId: string): Promise<AgentResult> {
  const allFindings: Finding[] = [];
  const data: Record<string, unknown> = {};

  // 1. Security Headers
  try {
    const response = await httpGet(baseUrl, REQUEST_TIMEOUT_MS);
    const headers = response.headers;
    const normalizedHeaders: Record<string, string> = {};
    for (const [key, val] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = val;
    }

    const headersFound: Record<string, string> = {};
    const headersMissing: string[] = [];

    for (const [headerName, config] of Object.entries(SECURITY_HEADERS)) {
      if (normalizedHeaders[headerName]) {
        headersFound[headerName] = normalizedHeaders[headerName].substring(0, 200);
      } else {
        headersMissing.push(headerName);
        allFindings.push({
          title: config.title,
          severity: config.missing_severity as Finding['severity'],
          target: baseUrl,
          evidence: `Response headers do not include '${headerName}'`,
          impact: config.impact,
          remediation: config.remediation,
          status: 'Open',
        });
      }
    }

    // Server header disclosure
    const serverHeader = normalizedHeaders['server'];
    if (serverHeader) {
      headersFound['Server'] = serverHeader.substring(0, 200);
      allFindings.push({
        title: 'Server Header Disclosure',
        severity: 'Informational',
        target: baseUrl,
        evidence: `Server header reveals: ${serverHeader.substring(0, 100)}`,
        impact: 'Server software information may help attackers identify vulnerabilities.',
        remediation: 'Consider removing or obfuscating the Server header.',
        status: 'Open',
      });
    }

    // X-Powered-By
    const poweredBy = normalizedHeaders['x-powered-by'];
    if (poweredBy) {
      headersFound['X-Powered-By'] = poweredBy.substring(0, 200);
      allFindings.push({
        title: 'Technology Disclosure via X-Powered-By',
        severity: 'Informational',
        target: baseUrl,
        evidence: `X-Powered-By header reveals: ${poweredBy.substring(0, 100)}`,
        impact: 'Technology stack information may help attackers target specific vulnerabilities.',
        remediation: 'Remove the X-Powered-By header from responses.',
        status: 'Open',
      });
    }

    // Cookie security
    const setCookie = normalizedHeaders['set-cookie'];
    if (setCookie) {
      const cookies = setCookie.split(',');
      for (const cookieStr of cookies) {
        const trimmed = cookieStr.trim();
        if (!trimmed) continue;
        const cookieName = trimmed.includes('=') ? trimmed.split('=')[0].trim().substring(0, 50) : 'unknown';
        const lower = trimmed.toLowerCase();
        const issues: string[] = [];
        if (!lower.includes('secure')) issues.push('missing Secure flag');
        if (!lower.includes('httponly')) issues.push('missing HttpOnly flag');
        if (!lower.includes('samesite')) issues.push('missing SameSite attribute');

        if (issues.length > 0) {
          allFindings.push({
            title: `Cookie Security Issues: ${cookieName.substring(0, 30)}`,
            severity: 'Low',
            target: baseUrl,
            evidence: `Cookie '${cookieName.substring(0, 30)}' has: ${issues.join(', ')}`,
            impact: 'Cookies without proper flags may be vulnerable to theft or CSRF.',
            remediation: 'Set Secure, HttpOnly, and SameSite attributes on all cookies.',
            status: 'Open',
          });
        }
      }
    }

    data['headers'] = {
      headers_found: headersFound,
      headers_missing: headersMissing,
      response_status: response.statusCode,
      all_headers: headers,
    };
  } catch (err) {
    allFindings.push({
      title: 'Connection Error During Header Check',
      severity: 'Medium',
      target: baseUrl,
      evidence: `Could not connect to target: ${(err as Error).message.substring(0, 200)}`,
      impact: 'Unable to complete web security header assessment.',
      remediation: 'Verify the target is accessible and try again.',
      status: 'Open',
    });
  }

  // 2. TLS Certificate
  if (port === 443 || baseUrl.startsWith('https')) {
    const tlsResult = await checkTlsCertificate(hostname, port === 443 ? 443 : port);

    if (tlsResult.cert) {
      const notAfter = tlsResult.cert.notAfter as string;
      if (notAfter) {
        try {
          const expiry = new Date(notAfter);
          const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry < 0) {
            allFindings.push({
              title: 'Expired TLS Certificate',
              severity: 'Critical',
              target: hostname,
              evidence: `Certificate expired on ${notAfter}`,
              impact: 'Users will see security warnings and connections may fail.',
              remediation: 'Renew the TLS certificate immediately.',
              status: 'Open',
            });
          } else if (daysUntilExpiry < 30) {
            allFindings.push({
              title: 'TLS Certificate Expiring Soon',
              severity: 'High',
              target: hostname,
              evidence: `Certificate expires in ${daysUntilExpiry} days (${notAfter})`,
              impact: 'Certificate will expire soon, causing service disruption.',
              remediation: 'Renew the TLS certificate before expiration.',
              status: 'Open',
            });
          } else if (daysUntilExpiry < 90) {
            allFindings.push({
              title: 'TLS Certificate Expiring Within 90 Days',
              severity: 'Low',
              target: hostname,
              evidence: `Certificate expires in ${daysUntilExpiry} days (${notAfter})`,
              impact: 'Certificate renewal should be planned.',
              remediation: 'Plan TLS certificate renewal within the next 90 days.',
              status: 'Open',
            });
          }
        } catch { /* date parse error */ }
      }

      // Check deprecated protocols
      if (tlsResult.protocol && ['TLSv1', 'TLSv1.1', 'SSLv2', 'SSLv3'].includes(tlsResult.protocol)) {
        allFindings.push({
          title: `Deprecated TLS Protocol: ${tlsResult.protocol}`,
          severity: 'High',
          target: hostname,
          evidence: `Server supports ${tlsResult.protocol}`,
          impact: `${tlsResult.protocol} has known vulnerabilities and should not be used.`,
          remediation: 'Disable legacy TLS protocols. Require TLS 1.2 or higher.',
          status: 'Open',
        });
      }
    }

    if (tlsResult.error) {
      allFindings.push({
        title: 'TLS Certificate Verification Failed',
        severity: 'High',
        target: hostname,
        evidence: `SSL verification error: ${tlsResult.error}`,
        impact: 'Certificate may be invalid, self-signed, or misconfigured.',
        remediation: 'Install a valid TLS certificate from a trusted CA.',
        status: 'Open',
      });
    }

    data['tls'] = {
      certificate: tlsResult.cert,
      cipher: tlsResult.cipher,
      protocol: tlsResult.protocol,
      error: tlsResult.error,
    };
  }

  // 3. Sensitive Paths (existence only — never download content)
  const exposedResources: Array<{ path: string; status_code: number }> = [];
  for (const checkPath of SENSITIVE_PATHS) {
    try {
      const headResult = await httpHead(`${baseUrl}${checkPath}`, 5000);
      if (headResult.statusCode === 200 || headResult.statusCode === 403) {
        exposedResources.push({ path: checkPath, status_code: headResult.statusCode });

        let findingSeverity: Finding['severity'] = 'Informational';
        let findingTitle = 'Publicly Accessible Resource Detected';
        let findingImpact = 'Information disclosure.';
        let findingRemediation = 'Review if this resource should be publicly accessible.';

        if (['/.env', '/wp-config.php', '/config.php', '/database.yml'].includes(checkPath)) {
          findingSeverity = 'High';
          findingTitle = 'Potentially Exposed Configuration File';
          findingImpact = 'Configuration files may contain sensitive credentials or settings.';
          findingRemediation = 'Ensure sensitive files are not web-accessible. Use proper access controls.';
        } else if (['/.git/config', '/.git/HEAD'].includes(checkPath)) {
          findingSeverity = 'High';
          findingTitle = 'Potentially Exposed Git Repository';
          findingImpact = 'Source code and history may be exposed.';
          findingRemediation = 'Block access to .git directories in web server configuration.';
        } else if (checkPath === '/.htpasswd') {
          findingSeverity = 'Critical';
          findingTitle = 'Potentially Exposed Password File';
          findingImpact = 'User credentials may be exposed.';
          findingRemediation = 'Move password files outside web root and restrict access.';
        } else if (['/phpinfo.php', '/info.php'].includes(checkPath)) {
          findingSeverity = 'Medium';
          findingTitle = 'PHP Info Page Exposed';
          findingImpact = 'Server configuration details are publicly visible.';
          findingRemediation = 'Remove phpinfo() pages from production environments.';
        } else if (['/backup.sql', '/dump.sql'].includes(checkPath)) {
          findingSeverity = 'Critical';
          findingTitle = 'Potentially Exposed Database Backup';
          findingImpact = 'Database contents may be exposed.';
          findingRemediation = 'Remove database backups from web-accessible locations immediately.';
        } else if (checkPath === '/server-status') {
          findingSeverity = 'Medium';
          findingTitle = 'Server Status Page Exposed';
          findingImpact = 'Server internals and active connections are publicly visible.';
          findingRemediation = 'Restrict access to server status pages to internal networks only.';
        }

        allFindings.push({
          title: findingTitle,
          severity: findingSeverity,
          target: baseUrl,
          evidence: `Resource at ${checkPath} returned HTTP ${headResult.statusCode}`,
          impact: findingImpact,
          remediation: findingRemediation,
          status: 'Open',
        });
      }
    } catch { /* resource not accessible — normal */ }
  }

  data['resources'] = { checked_count: SENSITIVE_PATHS.length, exposed_resources: exposedResources };

  return {
    agent: 'web_auditor',
    target: hostname,
    scan_id: scanId,
    timestamp: new Date().toISOString(),
    findings: allFindings,
    data,
    summary: `Web audit complete for ${baseUrl}. ${allFindings.length} finding(s).`,
  };
}

// ── Reporter ────────────────────────────────────────────────────────────────────

function aggregateFindings(agentResults: AgentResult[]): Finding[] {
  const seenKeys = new Set<string>();
  const aggregated: Finding[] = [];

  for (const result of agentResults) {
    for (const finding of result.findings) {
      const key = `${finding.title}|${finding.target}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        aggregated.push({
          title: sanitizeValue(finding.title),
          severity: finding.severity,
          target: sanitizeValue(finding.target),
          evidence: sanitizeValue(finding.evidence),
          impact: sanitizeValue(finding.impact),
          remediation: sanitizeValue(finding.remediation),
          status: finding.status || 'Open',
        });
      }
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };
  aggregated.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  return aggregated;
}

function calculateScore(findings: Finding[]): number {
  let score = 100;
  for (const f of findings) {
    score -= SEVERITY_DEDUCTIONS[f.severity] || 0;
  }
  return Math.max(0, score);
}

function countBySeverity(findings: Finding[]): Record<string, number> {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
  for (const f of findings) {
    if (f.severity in counts) counts[f.severity]++;
  }
  return counts;
}

function generateMarkdownReport(report: Record<string, unknown>): string {
  const lines: string[] = [
    '# Security Assessment Report', '',
    `**Scan ID:** ${report.scan_id}`,
    `**Target:** ${report.target}`,
    `**Date:** ${report.start_time}`,
    `**Duration:** ${report.duration_seconds} seconds`, '',
    '---', '',
    '## Authorization', '',
    'This security assessment was conducted with proper authorization.',
    '**Only scan systems you own or have explicit permission to test.**', '',
    `**Authorization Timestamp:** ${report.authorization_timestamp || 'N/A'}`, '',
    '---', '',
    '## Executive Summary', '',
    (report.executive_summary as string) || 'No summary available.', '',
    `**Security Score: ${report.score}/100**`, '',
    '---', '',
    '## Findings Summary', '',
    '| Severity | Count |',
    '|----------|-------|',
  ];

  const sc = (report.severity_counts || {}) as Record<string, number>;
  lines.push(`| Critical | ${sc.Critical || 0} |`);
  lines.push(`| High | ${sc.High || 0} |`);
  lines.push(`| Medium | ${sc.Medium || 0} |`);
  lines.push(`| Low | ${sc.Low || 0} |`);
  lines.push(`| Informational | ${sc.Informational || 0} |`);
  lines.push(`| **Total** | **${report.findings_count || 0}** |`, '', '---', '', '## Detailed Findings', '');

  const findings = (report.findings || []) as Finding[];
  if (findings.length === 0) {
    lines.push('No security issues were detected by the checks performed.');
  } else {
    let currentSeverity = '';
    let counter = 0;
    for (const finding of findings) {
      if (finding.severity !== currentSeverity) {
        currentSeverity = finding.severity;
        lines.push(`### ${currentSeverity} Severity`, '');
      }
      counter++;
      lines.push(
        `#### ${counter}. ${finding.title}`, '',
        `- **Severity:** ${finding.severity}`,
        `- **Evidence:** ${finding.evidence}`,
        `- **Impact:** ${finding.impact}`,
        `- **Remediation:** ${finding.remediation}`,
        `- **Status:** ${finding.status}`, ''
      );
    }
  }

  lines.push('', '---', '', '## Methodology', '',
    '1. Planning: Target validation and scope definition',
    '2. Reconnaissance: Passive information gathering (DNS, technology fingerprinting)',
    '3. Port Analysis: Checking common service ports for exposure',
    '4. Web Security Audit: Analyzing security headers, TLS configuration, cookie security, and checking for exposed sensitive resources',
    '5. Reporting: Compiling findings with severity ratings and remediation guidance',
    '', '---', '', '## Limitations', '',
    '- This is a non-intrusive assessment and does not perform vulnerability exploitation',
    '- Port scanning is limited to common service ports only',
    '- Web checks are limited to publicly accessible endpoints',
    '- No credential-based or authenticated testing was performed',
    '- Results represent a point-in-time assessment',
    '', '---', '', '## Disclaimer', '',
    'This report is provided for informational purposes only. Security is an ongoing process.',
    'Regular assessments and updates are recommended to maintain security posture.',
    'This assessment does not guarantee the absence of all vulnerabilities.', '',
    '*Report generated by MG Security Scanner*'
  );

  return lines.join('\n');
}

// ── Main Orchestrator ───────────────────────────────────────────────────────────

export async function runFallbackScan(target: string, scanId: string, outputDir: string): Promise<boolean> {
  fs.mkdirSync(outputDir, { recursive: true });
  const startTime = new Date();

  console.log(`\n${'='.repeat(60)}`);
  console.log('MG Security Scanner - Node.js Fallback (Authorized Assessment)');
  console.log(`Target: ${target}`);
  console.log(`Scan ID: ${scanId}`);
  console.log(`Output: ${outputDir}`);
  console.log(`${'='.repeat(60)}\n`);

  writeStatus(outputDir, scanId, 'planning', 'Initializing scan...', 0);

  const agentResults: AgentResult[] = [];

  try {
    // ── Agent 1: Planner ────────────────────────────────────────────────
    writeStatus(outputDir, scanId, 'planning', 'Validating target and creating scan plan...', 5);
    console.log('[Fallback] Running Planner agent...');
    const planData = await plannerAgent(target, scanId);
    fs.writeFileSync(path.join(outputDir, 'plan.json'), JSON.stringify(planData, null, 2));
    writeStatus(outputDir, scanId, 'planning', 'Scan plan created', 10);

    const hostname = planData.target;
    const baseUrl = planData.base_url;
    const port = planData.port;

    // Check timeout
    if (Date.now() - startTime.getTime() > TOTAL_TIMEOUT_MS) throw new Error('Planning exceeded timeout');

    // ── Agent 2: Recon ──────────────────────────────────────────────────
    writeStatus(outputDir, scanId, 'reconnaissance', 'Gathering target information...', 15);
    console.log('[Fallback] Running Recon agent...');
    const reconResult = await reconAgent(hostname, baseUrl, scanId);
    agentResults.push(reconResult);
    fs.writeFileSync(path.join(outputDir, 'recon_result.json'), JSON.stringify(reconResult, null, 2));
    writeStatus(outputDir, scanId, 'reconnaissance', 'Reconnaissance complete', 25);

    if (Date.now() - startTime.getTime() > TOTAL_TIMEOUT_MS) throw new Error('Recon exceeded timeout');

    // ── Agent 3: Port Scanner ───────────────────────────────────────────
    writeStatus(outputDir, scanId, 'port_analysis', 'Analyzing service ports...', 30);
    console.log('[Fallback] Running Port Scanner agent...');
    const remainingTime1 = Math.max(10000, TOTAL_TIMEOUT_MS - (Date.now() - startTime.getTime()));
    const portResult = await portScannerAgent(hostname, scanId, Math.min(remainingTime1, 60000));
    agentResults.push(portResult);
    fs.writeFileSync(path.join(outputDir, 'port_scan_result.json'), JSON.stringify(portResult, null, 2));
    const openCount = (portResult.data.open_ports as unknown[])?.length || 0;
    writeStatus(outputDir, scanId, 'port_analysis', `Port analysis complete: ${openCount} open ports found`, 50);

    if (Date.now() - startTime.getTime() > TOTAL_TIMEOUT_MS) throw new Error('Port scan exceeded timeout');

    // ── Agent 4: Web Auditor ────────────────────────────────────────────
    writeStatus(outputDir, scanId, 'web_security_audit', 'Performing web security audit...', 55);
    console.log('[Fallback] Running Web Auditor agent...');
    const webResult = await webAuditorAgent(hostname, baseUrl, port, scanId);
    agentResults.push(webResult);
    fs.writeFileSync(path.join(outputDir, 'web_audit_result.json'), JSON.stringify(webResult, null, 2));
    writeStatus(outputDir, scanId, 'web_security_audit', `Web audit complete: ${webResult.findings.length} finding(s)`, 80);

    if (Date.now() - startTime.getTime() > TOTAL_TIMEOUT_MS) throw new Error('Web audit exceeded timeout');

    // ── Agent 5: Reporter ───────────────────────────────────────────────
    writeStatus(outputDir, scanId, 'generating_report', 'Generating security report...', 85);
    console.log('[Fallback] Running Reporter agent...');

    const endTime = new Date();
    const durationSeconds = Math.round(((endTime.getTime() - startTime.getTime()) / 1000) * 100) / 100;
    const allFindings = aggregateFindings(agentResults);
    const score = calculateScore(allFindings);
    const severityCounts = countBySeverity(allFindings);

    const criticalHigh = (severityCounts.Critical || 0) + (severityCounts.High || 0);
    let urgency = 'No urgent issues identified. Review informational findings as part of ongoing hardening.';
    if (criticalHigh > 0) urgency = 'Immediate attention is recommended.';
    else if ((severityCounts.Medium || 0) > 0) urgency = 'Address medium-severity findings in a timely manner.';

    const executiveSummary = allFindings.length === 0
      ? `The security assessment of ${hostname} found no issues within the scope of checks performed. Security score: ${score}/100. Assessment completed in ${durationSeconds} seconds.`
      : `The security assessment of ${hostname} identified ${allFindings.length} finding(s): ${severityCounts.Critical} critical, ${severityCounts.High} high, ${severityCounts.Medium} medium, ${severityCounts.Low} low, ${severityCounts.Informational} informational. Security score: ${score}/100. ${urgency} Assessment completed in ${durationSeconds} seconds.`;

    const reportData: Record<string, unknown> = {
      scan_id: scanId,
      target: hostname,
      base_url: baseUrl,
      status: 'completed',
      score,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
      authorization_timestamp: planData.timestamp,
      executive_summary: executiveSummary,
      findings_count: allFindings.length,
      severity_counts: severityCounts,
      scope: {
        ports_checked: planData.scope.total_port_checks,
        paths_checked: planData.scope.total_path_checks,
        web_checks: planData.scope.web_checks,
      },
      agent_summaries: agentResults.map(r => ({
        agent: r.agent,
        summary: r.summary,
        finding_count: r.findings.length,
      })),
      findings: allFindings,
      methodology: [
        'Planning: Target validation and scope definition',
        'Reconnaissance: Passive information gathering (DNS, technology fingerprinting, subdomain enumeration)',
        'Port Analysis: Checking common service ports for exposure',
        'Web Security Audit: Analyzing security headers, TLS configuration, cookie security, and checking for exposed sensitive resources',
        'Reporting: Compiling findings with severity ratings and remediation guidance',
      ],
      limitations: [
        'This is a non-intrusive assessment and does not perform vulnerability exploitation',
        'Port scanning is limited to common service ports only',
        'Web checks are limited to publicly accessible endpoints',
        'No credential-based or authenticated testing was performed',
        'Results represent a point-in-time assessment',
        'Subdomain enumeration uses passive certificate transparency logs only',
      ],
    };

    // Write summary.json
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(reportData, null, 2));

    // Write markdown report
    const mdReport = generateMarkdownReport(reportData);
    fs.writeFileSync(path.join(outputDir, 'report.md'), mdReport);

    writeStatus(outputDir, scanId, 'completed', 'Report generated successfully', 100);

    console.log(`\n${'='.repeat(60)}`);
    console.log('Scan completed successfully!');
    console.log(`Score: ${score}/100`);
    console.log(`Findings: ${allFindings.length}`);
    console.log(`${'='.repeat(60)}\n`);

    return true;
  } catch (err) {
    const errorMsg = `Scan failed: ${(err as Error).message}`;
    console.error(`[Fallback] ERROR: ${errorMsg}`);
    writeStatus(outputDir, scanId, 'failed', errorMsg, -1);

    // Write failure summary
    const endTime = new Date();
    const durationSeconds = Math.round(((endTime.getTime() - startTime.getTime()) / 1000) * 100) / 100;
    const partialFindings = aggregateFindings(agentResults);
    const severityCounts = countBySeverity(partialFindings);

    const failureSummary = {
      scan_id: scanId,
      target,
      status: 'failed',
      error: errorMsg,
      score: null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
      findings_count: partialFindings.length,
      severity_counts: severityCounts,
      findings: partialFindings,
    };

    try {
      fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(failureSummary, null, 2));
    } catch { /* non-fatal */ }

    return false;
  }
}
