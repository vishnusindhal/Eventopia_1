const nodemailer = require('nodemailer');

// ── Transporter (lazy-initialized) ──────────────────────────
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[Email] EMAIL_USER / EMAIL_PASSWORD not set – emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: { user, pass }
  });

  return transporter;
}

// ── Shared HTML wrapper ─────────────────────────────────────
function wrapHtml(bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eventopia</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:.5px;">🎯 Eventopia</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Your gateway to engineering events</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;color:#e2e8f0;font-size:15px;line-height:1.7;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;border-top:1px solid #334155;color:#94a3b8;font-size:12px;">
            <p style="margin:0;">© ${new Date().getFullYear()} Eventopia · Built with ❤️ for students</p>
            <p style="margin:4px 0 0;">You're receiving this because of your notification preferences.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Send single event notification email ─────────────────────
async function sendEventNotification(to, event) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  const eventUrl = `${clientUrl}/event/${event._id}`;
  const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA';

  const bodyHtml = `
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;">New Event Published! 🚀</h2>
    <p style="margin:0 0 20px;color:#94a3b8;">A new <strong style="color:#a78bfa;">${event.type}</strong> has been posted by <strong style="color:#a78bfa;">${event.college}</strong>.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Event Details</p>
        <h3 style="margin:0 0 12px;color:#f1f5f9;font-size:18px;">${event.title}</h3>
        <p style="margin:4px 0;color:#cbd5e1;">📅 <strong>Date:</strong> ${eventDate}</p>
        <p style="margin:4px 0;color:#cbd5e1;">📍 <strong>Venue:</strong> ${event.venue || 'Online'}</p>
        <p style="margin:4px 0;color:#cbd5e1;">🏫 <strong>Institute:</strong> ${event.college}</p>
        <p style="margin:4px 0;color:#cbd5e1;">🏷️ <strong>Category:</strong> ${event.type}</p>
      </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td align="center" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;">
        <a href="${eventUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;">View Event →</a>
      </td></tr>
    </table>
  `;

  const subject = `🚀 New ${event.type} at ${event.college} – Eventopia`;
  await sendMail(to, subject, wrapHtml(bodyHtml));
}

// ── Send daily digest email ──────────────────────────────────
async function sendDailyDigest(to, eventsByCategory, date) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  let categoryRows = '';
  for (const [category, events] of Object.entries(eventsByCategory)) {
    categoryRows += `
      <tr>
        <td style="padding:10px 16px;color:#e2e8f0;border-bottom:1px solid #334155;">${category}</td>
        <td style="padding:10px 16px;color:#a78bfa;font-weight:600;text-align:center;border-bottom:1px solid #334155;">${events.length}</td>
      </tr>`;
  }

  const totalEvents = Object.values(eventsByCategory).reduce((sum, arr) => sum + arr.length, 0);

  const bodyHtml = `
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;">Today's Events Summary 📋</h2>
    <p style="margin:0 0 20px;color:#94a3b8;">${formattedDate} · ${totalEvents} new event${totalEvents !== 1 ? 's' : ''}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <th style="padding:12px 16px;text-align:left;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #334155;">Category</th>
        <th style="padding:12px 16px;text-align:center;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #334155;">Count</th>
      </tr>
      ${categoryRows}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td align="center" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;">
        <a href="${clientUrl}/events" target="_blank" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Browse Events →</a>
      </td></tr>
    </table>
  `;

  const subject = `📋 Daily Digest – ${totalEvents} New Events on Eventopia`;
  await sendMail(to, subject, wrapHtml(bodyHtml));
}

// ── Core send helper ─────────────────────────────────────────
async function sendMail(to, subject, html) {
  const t = getTransporter();

  if (!t) {
    // Fallback: log to console in development
    console.log(`\n[Email – Console Fallback]\n  To: ${to}\n  Subject: ${subject}\n  (HTML body omitted)\n`);
    return;
  }

  try {
    const info = await t.sendMail({
      from: `"Eventopia" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

module.exports = { sendEventNotification, sendDailyDigest, sendMail };
