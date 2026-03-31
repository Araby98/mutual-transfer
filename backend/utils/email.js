// Email utility using nodemailer
// Configure your SMTP credentials below (or use environment variables)
const nodemailer = require('nodemailer');

// Create a transporter - configure with your real SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || '"Tabadol" <noreply@tabadol.ma>';

/**
 * Send email verification link after signup
 */
async function sendVerificationEmail(user, otp) {
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: user.email,
    subject: 'Your Tabadol verification code | رمز التحقق',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 12px; background: #f8faff; border: 1px solid #e0e7ff;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Tabadol – Email Verification</h2>
        <p style="color: #374151;">Hello <strong>${user.firstName || user.email}</strong>,</p>
        <p style="color: #374151;">Use the code below to verify your email address. It expires in <strong>24 hours</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: #4f46e5; color: white; padding: 18px 48px; border-radius: 12px; font-size: 36px; font-weight: bold; letter-spacing: 10px;">
            ${otp}
          </div>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not register on Tabadol, you can safely ignore this email.</p>
        <hr style="margin: 24px 0; border-color: #e0e7ff;">
        <p style="color: #374151; text-align: right; direction: rtl;">رمز التحقق الخاص بك هو: <strong style="font-size: 24px; letter-spacing: 6px; color: #4f46e5;">${otp}</strong></p>
      </div>
    `
  });
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(user, token) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: user.email,
    subject: 'Reset your Tabadol password | إعادة تعيين كلمة المرور',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 12px; background: #f8faff; border: 1px solid #e0e7ff;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Tabadol – Password Reset</h2>
        <p style="color: #374151;">Hello <strong>${user.firstName}</strong>,</p>
        <p style="color: #374151;">We received a request to reset your password. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
        <hr style="margin: 24px 0; border-color: #e0e7ff;">
        <p style="color: #374151; text-align: right; direction: rtl;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
      </div>
    `
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
