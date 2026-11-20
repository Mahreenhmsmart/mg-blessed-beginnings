/**
 * PDF Service — Generate branded audit reports using PDFKit.
 */

import PDFDocument from 'pdfkit';
import type { IAudit } from '../models/Audit';

// Brand colors
const COLORS = {
  purple: '#7662C7',
  teal: '#29ADA4',
  dark: '#1a1a2e',
  light: '#f8f9fa',
  text: '#333333',
  muted: '#666666',
  border: '#e0e0e0',
};

interface ReportData {
  projectName: string;
  projectUrl: string;
  auditDate: Date;
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    aio: number;
    sxo: number;
  };
  recommendations: Array<{
    severity: string;
    title: string;
    description: string;
    layer: string;
    effort: string;
  }>;
}

/**
 * Generate a branded PDF audit report.
 * Returns a readable stream that can be piped to a response.
 */
export function generateAuditReport(data: ReportData): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `MG Visibility Report - ${data.projectName}`,
      Author: 'MG Blessed Beginnings',
      Subject: 'Website Visibility Audit Report',
    },
  });

  // ─── Cover Page ──────────────────────────────────────────────────────────
  
  // Gradient header background
  doc.rect(0, 0, 595, 200)
     .fill(COLORS.purple);
  
  // Logo/Brand area
  doc.fillColor('white')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('MG Blessed Beginnings', 50, 60);
  
  doc.fontSize(14)
     .font('Helvetica')
     .text('Visibility Intelligence Platform', 50, 95);

  // Report title
  doc.fillColor(COLORS.dark)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Website Visibility Audit Report', 50, 230);

  // Project info
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor(COLORS.muted)
     .text(`Project: ${data.projectName}`, 50, 280)
     .text(`URL: ${data.projectUrl}`, 50, 300)
     .text(`Date: ${data.auditDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 320);

  // ─── Scores Section ──────────────────────────────────────────────────────
  
  let y = 380;
  
  doc.fillColor(COLORS.dark)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('Visibility Scores', 50, y);
  
  y += 30;

  // Score boxes
  const scoreEntries: Array<{ label: string; value: number; color: string }> = [
    { label: 'SEO', value: data.scores.seo, color: COLORS.purple },
    { label: 'AEO', value: data.scores.aeo, color: COLORS.teal },
    { label: 'GEO', value: data.scores.geo, color: '#E91E63' },
    { label: 'AIO', value: data.scores.aio, color: '#FFC107' },
    { label: 'SXO', value: data.scores.sxo, color: COLORS.purple },
  ];

  const boxWidth = 90;
  const gap = 10;
  const startX = 50;

  scoreEntries.forEach((entry, i) => {
    const x = startX + i * (boxWidth + gap);
    
    // Box background
    doc.rect(x, y, boxWidth, 80)
       .fill(COLORS.light)
       .stroke(COLORS.border);
    
    // Score value
    doc.fillColor(entry.color)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(String(entry.value), x, y + 15, { width: boxWidth, align: 'center' });
    
    // Label
    doc.fillColor(COLORS.muted)
       .fontSize(10)
       .font('Helvetica')
       .text(entry.label, x, y + 55, { width: boxWidth, align: 'center' });
  });

  // ─── Recommendations Section ─────────────────────────────────────────────
  
  y += 120;
  
  doc.fillColor(COLORS.dark)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text(`Recommendations (${data.recommendations.length})`, 50, y);
  
  y += 30;

  // Group by severity
  const critical = data.recommendations.filter(r => r.severity === 'critical');
  const warning = data.recommendations.filter(r => r.severity === 'warning');
  const info = data.recommendations.filter(r => r.severity === 'info');

  const renderRecommendations = (items: typeof data.recommendations, severityColor: string, startY: number): number => {
    if (items.length === 0) return startY;

    let currentY = startY;

    items.forEach((rec) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Severity badge
      doc.rect(50, currentY, 60, 18)
         .fill(severityColor);
      
      doc.fillColor('white')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(rec.severity.toUpperCase(), 50, currentY + 4, { width: 60, align: 'center' });

      // Title
      doc.fillColor(COLORS.dark)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(rec.title, 120, currentY + 2, { width: 400 });

      // Description
      doc.fillColor(COLORS.muted)
         .fontSize(9)
         .font('Helvetica')
         .text(rec.description, 120, currentY + 18, { width: 400, lineGap: 2 });

      // Meta info
      doc.fontSize(8)
         .text(`Layer: ${rec.layer.toUpperCase()} | Effort: ${rec.effort}`, 120, currentY + 45);

      // Separator line
      doc.moveTo(50, currentY + 60)
         .lineTo(545, currentY + 60)
         .strokeColor(COLORS.border)
         .stroke();

      currentY += 70;
    });

    return currentY;
  };

  if (critical.length > 0) {
    doc.fillColor('#D32F2F')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Critical Issues', 50, y);
    y = renderRecommendations(critical, '#D32F2F', y + 20);
    y += 15;
  }

  if (warning.length > 0) {
    doc.fillColor('#F57C00')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Warnings', 50, y);
    y = renderRecommendations(warning, '#F57C00', y + 20);
    y += 15;
  }

  if (info.length > 0) {
    doc.fillColor(COLORS.teal)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Info', 50, y);
    y = renderRecommendations(info, COLORS.teal, y + 20);
  }

  // ─── Footer on each page ─────────────────────────────────────────────────
  
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer line
    doc.moveTo(50, 780)
       .lineTo(545, 780)
       .strokeColor(COLORS.border)
       .stroke();
    
    // Footer text
    doc.fillColor(COLORS.muted)
       .fontSize(8)
       .font('Helvetica')
       .text(`MG Blessed Beginnings — Visibility Intelligence Report`, 50, 790);
    
    doc.text(`Page ${i + 1} of ${pageCount}`, 480, 790, { width: 65, align: 'right' });
  }

  doc.end();
  return doc;
}

/**
 * Convert an Audit document to report data format.
 */
export function auditToReportData(audit: IAudit, projectName: string, projectUrl: string): ReportData {
  return {
    projectName,
    projectUrl,
    auditDate: audit.createdAt,
    scores: audit.scores,
    recommendations: audit.recommendations || [],
  };
}

// ─── Extended Website Health Report ──────────────────────────────────────

interface HealthReportData extends ReportData {
  overallScore: number;
  extendedScores: Record<string, number>;
  issuesBySeverity: { critical: number; high: number; medium: number; low: number; passed: number };
  topActions: Array<{ rank: number; title: string; category: string; priorityScore: number }>;
}

/**
 * Generate a comprehensive "Website Health Report" PDF with all 13 categories.
 */
export function generateHealthReport(data: HealthReportData): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Website Health Report - ${data.projectName}`,
      Author: 'MG Blessed Beginnings',
      Subject: 'Comprehensive Website Intelligence Audit',
    },
  });

  // Cover Page
  doc.rect(0, 0, 595, 200).fill(COLORS.purple);
  doc.fillColor('white').fontSize(28).font('Helvetica-Bold')
     .text('MG Blessed Beginnings', 50, 60);
  doc.fontSize(14).font('Helvetica')
     .text('Website Intelligence Platform', 50, 95);

  doc.fillColor(COLORS.dark).fontSize(24).font('Helvetica-Bold')
     .text('Website Health Report', 50, 230);
  doc.fontSize(12).font('Helvetica').fillColor(COLORS.muted)
     .text(`Project: ${data.projectName}`, 50, 280)
     .text(`URL: ${data.projectUrl}`, 50, 300)
     .text(`Date: ${data.auditDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 320);

  // Overall Score
  let y = 380;
  doc.fillColor(COLORS.dark).fontSize(18).font('Helvetica-Bold')
     .text('Overall Health Score', 50, y);
  y += 30;

  const scoreColor = data.overallScore >= 70 ? COLORS.teal : data.overallScore >= 40 ? '#EDC054' : '#E560A5';
  doc.rect(50, y, 120, 80).fill(COLORS.light).stroke(COLORS.border);
  doc.fillColor(scoreColor).fontSize(36).font('Helvetica-Bold')
     .text(String(data.overallScore), 50, y + 15, { width: 120, align: 'center' });
  doc.fillColor(COLORS.muted).fontSize(10).font('Helvetica')
     .text('/ 100', 50, y + 55, { width: 120, align: 'center' });

  // Score Breakdown
  y += 110;
  doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold')
     .text('Score Breakdown', 50, y);
  y += 25;

  const allScores = Object.entries(data.extendedScores);
  const colWidth = 120;
  for (let i = 0; i < allScores.length; i++) {
    const [key, value] = allScores[i];
    if (!value && value !== 0) continue;
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 50 + col * colWidth;
    const cellY = y + row * 40;

    if (cellY > 700) { doc.addPage(); y = 50; }

    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica')
       .text(key.toUpperCase(), x, cellY);
    doc.fillColor(value >= 70 ? COLORS.teal : value >= 40 ? '#EDC054' : '#E560A5')
       .fontSize(16).font('Helvetica-Bold')
       .text(String(value), x, cellY + 12);
  }

  // Issues by Severity
  y += Math.ceil(allScores.length / 4) * 40 + 30;
  if (y > 650) { doc.addPage(); y = 50; }

  doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold')
     .text('Issues Summary', 50, y);
  y += 25;

  const severities = [
    { label: 'Critical', count: data.issuesBySeverity.critical, color: '#D32F2F' },
    { label: 'High', count: data.issuesBySeverity.high, color: '#F57C00' },
    { label: 'Medium', count: data.issuesBySeverity.medium, color: '#EDC054' },
    { label: 'Low', count: data.issuesBySeverity.low, color: COLORS.teal },
    { label: 'Passed', count: data.issuesBySeverity.passed, color: '#4CAF50' },
  ];

  for (const sev of severities) {
    doc.rect(50, y, 15, 15).fill(sev.color);
    doc.fillColor(COLORS.dark).fontSize(11).font('Helvetica')
       .text(`${sev.label}: ${sev.count}`, 72, y + 2);
    y += 22;
  }

  // Top 10 Actions
  y += 15;
  if (y > 600) { doc.addPage(); y = 50; }

  doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold')
     .text('Top 10 Priority Actions', 50, y);
  y += 25;

  for (const action of data.topActions) {
    if (y > 720) { doc.addPage(); y = 50; }
    doc.fillColor(COLORS.purple).fontSize(11).font('Helvetica-Bold')
       .text(`${action.rank}. ${action.title}`, 50, y);
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica')
       .text(`${action.category} | Priority: ${action.priorityScore}`, 70, y + 14);
    y += 30;
  }

  // Footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.moveTo(50, 780).lineTo(545, 780).strokeColor(COLORS.border).stroke();
    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
       .text('MG Blessed Beginnings — Website Health Report', 50, 790);
    doc.text(`Page ${i + 1} of ${pageCount}`, 480, 790, { width: 65, align: 'right' });
  }

  doc.end();
  return doc;
}

/**
 * Build health report data from an Audit document.
 */
export function buildHealthReportData(
  audit: IAudit,
  projectName: string,
  projectUrl: string,
  topActions: Array<{ rank: number; issueId: string; title: string; category: string; priorityScore: number }>,
): HealthReportData {
  const scores = audit.scores;
  const allScoreValues = Object.values(scores).filter((v): v is number => typeof v === 'number');
  const overallScore = allScoreValues.length > 0
    ? Math.round(allScoreValues.reduce((a, b) => a + b, 0) / allScoreValues.length)
    : 0;

  // Count issues by severity from results
  let critical = 0, high = 0, medium = 0, low = 0, passed = 0;
  for (const layerResults of Object.values(audit.results || {})) {
    if (!layerResults?.checks) continue;
    for (const check of layerResults.checks) {
      if (check.status === 'fail') critical++;
      else if (check.status === 'warn') medium++;
      else passed++;
    }
  }

  return {
    projectName,
    projectUrl,
    auditDate: audit.createdAt,
    scores: { seo: scores.seo, aeo: scores.aeo, geo: scores.geo, aio: scores.aio, sxo: scores.sxo },
    recommendations: audit.recommendations || [],
    overallScore,
    extendedScores: scores as unknown as Record<string, number>,
    issuesBySeverity: { critical, high, medium, low, passed },
    topActions,
  };
}
