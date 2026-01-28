const nodemailer = require('nodemailer');
require('dotenv').config();

// Create SMTP transporter for Gmail
const createEmailTransporter = () => {
  try {
    // Validate required environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Missing Gmail SMTP credentials. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
    }

    // Try port 587 (STARTTLS) first, as it's more compatible with cloud platforms
    // If 587 fails, Railway might be blocking SMTP altogether
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587, // Try 587 (STARTTLS) instead of 465 (SSL)
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
      requireTLS: true,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error.message);
    throw error;
  }
};

// Verify SMTP connection
const verifyEmailConnection = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error.message);
    return false;
  }
};

module.exports = {
  createEmailTransporter,
  verifyEmailConnection
};
