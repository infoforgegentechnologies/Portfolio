require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  const { name, email, projectType, budgetRange, message } = req.body || {};
  const payload = {
    name,
    email,
    projectType,
    budgetRange,
    message,
    receivedAt: new Date().toISOString()
  };

  console.log('Received contact request:', payload);

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
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        replyTo: email || process.env.SMTP_USER,
        subject: `New inquiry from ${name || 'website visitor'}`,
        html: `
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Project Type:</strong> ${projectType || 'N/A'}</p>
          <p><strong>Budget Range:</strong> ${budgetRange || 'N/A'}</p>
          <p><strong>Message:</strong><br>${message || 'N/A'}</p>
        `
      });

      return res.json({
        success: true,
        message: 'Thanks! Your request has been received and sent by email.'
      });
    } catch (error) {
      console.error('Email delivery failed:', error);
      return res.status(500).json({ success: false, message: 'Your message reached the server, but email delivery failed.' });
    }
  }

  return res.json({
    success: true,
    message: 'Thanks! Your request has been received by the backend. Add real SMTP credentials to email it to info.forgegentechnologies26@gmail.com.'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index (5).html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index (5).html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { app };
