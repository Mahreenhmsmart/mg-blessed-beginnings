/**
 * Email Service — Nodemailer-based email sending with MG Blessed Beginnings branding.
 * Uses lazy initialization to avoid ESM hoisting issues with dotenv.
 */

import nodemailer, { type Transporter } from 'nodemailer';

// Brand colors for email templates
const BRAND_COLORS = {
  purple: '#7662C7',
  teal: '#29ADA4',
  dark: '#1a1a2e',
  light: '#f8f9fa',
};

// Lazy transporter initialization — ESM imports hoist above dotenv.config()
let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send an email using the configured SMTP transporter.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const fromEmail = process.env.SMTP_EMAIL;
  if (!fromEmail) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_EMAIL, and SMTP_PASSWORD in your .env file.');
  }

  await getTransporter().sendMail({
    from: `"MG Blessed Beginnings" <${fromEmail}>`,
    to,
    subject,
    html,
  });
}

/**
 * Generate branded email header HTML.
 */
function getEmailHeader(title: string): string {
  return `
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.purple}, ${BRAND_COLORS.teal}); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px;">
        MG Blessed Beginnings
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">
        ${title}
      </p>
    </div>
  `;
}

/**
 * Generate branded email footer HTML.
 */
function getEmailFooter(): string {
  return `
    <div style="background-color: ${BRAND_COLORS.dark}; padding: 20px; text-align: center; color: rgba(255,255,255,0.7); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} MG Blessed Beginnings. All rights reserved.</p>
      <p style="margin: 8px 0 0;">Visibility Intelligence for Modern Businesses</p>
    </div>
  `;
}

/**
 * Wrap content in branded email template.
 */
function wrapInTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <tr>
          <td>${getEmailHeader('Visibility Intelligence Platform')}</td>
        </tr>
        <tr>
          <td style="padding: 30px 20px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td>${getEmailFooter()}</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ─── Contact Form Emails ──────────────────────────────────────────────────────

/**
 * Send confirmation email to contact form submitter.
 */
export async function sendContactConfirmation(to: string, name: string, subject: string): Promise<void> {
  const content = `
    <h2 style="color: ${BRAND_COLORS.purple}; margin-top: 0;">Thank You, ${name}!</h2>
    <p style="color: #333; line-height: 1.6;">
      We've received your message regarding <strong>"${subject}"</strong> and will get back to you within 24-48 hours.
    </p>
    <div style="background-color: ${BRAND_COLORS.light}; border-left: 4px solid ${BRAND_COLORS.teal}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #555; font-size: 14px;">
        <strong>What happens next?</strong><br>
        Our team will review your inquiry and respond with personalized recommendations or answers to your questions.
      </p>
    </div>
    <p style="color: #666; font-size: 14px;">
      In the meantime, feel free to explore our <a href="/ai-tools" style="color: ${BRAND_COLORS.purple}; text-decoration: none;">free AI tools</a> 
      or check out our <a href="/blog" style="color: ${BRAND_COLORS.purple}; text-decoration: none;">latest blog posts</a>.
    </p>
  `;

  await sendEmail(to, `We've received your message — MG Blessed Beginnings`, wrapInTemplate(content));
}

/**
 * Send notification email to admin about new contact submission.
 */
export async function sendContactAdminNotification(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const adminEmail = 'hmsmart.official@gmail.com';

  const sentAt = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const content = `
    <h2 style="color: ${BRAND_COLORS.purple}; margin-top: 0;">New Contact Submission</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 100px; color: #555;">Name:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: ${BRAND_COLORS.purple};">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Subject:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${subject}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Time:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${sentAt}</td>
      </tr>
    </table>
    <div style="background-color: ${BRAND_COLORS.light}; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #555;">Message:</p>
      <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>
  `;

  // Exact required subject format: "MG Contact: <subject> — <sender name>"
  await sendEmail(adminEmail, `MG Contact: ${subject} — ${name}`, wrapInTemplate(content));
}

// ─── Consultation Booking Emails ──────────────────────────────────────────────

/**
 * Send booking confirmation to client.
 */
export async function sendConsultationConfirmation(
  to: string,
  name: string,
  service: string,
  date: Date,
  time: string
): Promise<void> {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <h2 style="color: ${BRAND_COLORS.purple}; margin-top: 0;">Consultation Booked!</h2>
    <p style="color: #333; line-height: 1.6;">
      Hi ${name}, your consultation has been successfully scheduled.
    </p>
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.purple}15, ${BRAND_COLORS.teal}15); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: ${BRAND_COLORS.purple};">Service:</td>
          <td style="padding: 8px 0; color: #333;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: ${BRAND_COLORS.purple};">Date:</td>
          <td style="padding: 8px 0; color: #333;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: ${BRAND_COLORS.purple};">Time:</td>
          <td style="padding: 8px 0; color: #333;">${time}</td>
        </tr>
      </table>
    </div>
    <p style="color: #666; font-size: 14px;">
      We'll send a reminder 24 hours before your appointment. If you need to reschedule, 
      please contact us at <a href="mailto:${process.env.SMTP_EMAIL}" style="color: ${BRAND_COLORS.purple};">${process.env.SMTP_EMAIL}</a>.
    </p>
  `;

  await sendEmail(to, `Your consultation is confirmed — MG Blessed Beginnings`, wrapInTemplate(content));
}

/**
 * Send notification to admin about new consultation booking.
 */
export async function sendConsultationAdminNotification(
  name: string,
  email: string,
  phone: string,
  service: string,
  date: Date,
  time: string,
  message?: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
  if (!adminEmail) return;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const content = `
    <h2 style="color: ${BRAND_COLORS.purple}; margin-top: 0;">New Consultation Booking</h2>
    <div style="background-color: ${BRAND_COLORS.light}; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px; color: #555;">Client Name:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #555;">Email:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: ${BRAND_COLORS.purple};">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #555;">Phone:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #555;">Service:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #555;">Date & Time:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${formattedDate} at ${time}</td>
        </tr>
      </table>
    </div>
    ${message ? `
      <div style="background-color: ${BRAND_COLORS.light}; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #555;">Additional Notes:</p>
        <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
    ` : ''}
  `;

  await sendEmail(adminEmail, `[Booking] New consultation: ${name} — ${service}`, wrapInTemplate(content));
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Check if email service is configured.
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_EMAIL &&
    process.env.SMTP_PASSWORD
  );
}
