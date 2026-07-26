require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Invalid JSON payload' })
    };
  }

  const { name, email, projectType, budgetRange, message } = payload;
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = process.env.SMTP_PORT?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const isPlaceholderSmtp = !smtpHost || !smtpPort || !smtpUser || !smtpPass || /your_|example/i.test(`${smtpHost}${smtpPort}${smtpUser}${smtpPass}`);
  const hasSmtpConfig = Boolean(smtpHost && smtpPort && smtpUser && smtpPass && !isPlaceholderSmtp);

  if (hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: process.env.SMTP_SECURE === 'true' || Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: process.env.CONTACT_EMAIL || smtpUser,
        replyTo: email || smtpUser,
        subject: `New inquiry from ${name || 'website visitor'}`,
        html: `
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Project Type:</strong> ${projectType || 'N/A'}</p>
          <p><strong>Budget Range:</strong> ${budgetRange || 'N/A'}</p>
          <p><strong>Message:</strong><br>${message || 'N/A'}</p>
        `
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Thanks! Your request has been received and sent by email.' })
      };
    } catch (error) {
      console.error('Email delivery failed:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Your message reached the backend, but email delivery failed.' })
      };
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, message: 'Thanks! Your request has been received by the backend. Add real SMTP credentials in Netlify environment variables to email it.' })
  };
};
