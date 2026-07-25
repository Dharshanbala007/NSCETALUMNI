import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a generic transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
export const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[Email Mock] Would have sent email to ${to}: "${subject}"`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"NSCET Alumni Registry" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} (to: ${to})`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err);
    return false;
  }
};
