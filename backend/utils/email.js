// Email utility using Brevo HTTPS API
// Completely bypasses Railway's blocked SMTP ports

const getEnvObj = (key, defaultVal) => String(process.env[key] || defaultVal).replace(/"/g, '');

const APP_URL = getEnvObj('APP_URL', 'https://frontend-mts2.vercel.app');
const FROM_EMAIL = getEnvObj('FROM_EMAIL', 'tabadol26@outlook.com');
// NOTE: For Brevo API, you must generate an API Key, it is different from the SMTP password!
// It usually starts with "xkeysib-"
const BREVO_API_KEY = getEnvObj('BREVO_API_KEY', getEnvObj('SMTP_PASS', ''));

/**
 * Helper function to send email via Brevo HTTPS API
 */
async function sendViaBrevoAPI(toEmail, toName, subject, htmlContent) {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY block email sending.");
    return;
  }

  const payload = {
    sender: { name: "Tabadol", email: FROM_EMAIL },
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Brevo API Error:', response.status, errText);
      throw new Error(`Brevo API Error: ${errText}`);
    }

    console.log(`Email successfully sent via API to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send email via API:', error.message);
    throw error;
  }
}

/**
 * Send email verification link after signup
 */
async function sendVerificationEmail(user, otp) {
  const subject = 'Your Tabadol verification code | رمز التحقق';
  const html = `
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
  `;
  await sendViaBrevoAPI(user.email, user.firstName, subject, html);
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(user, token) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  const subject = 'Reset your Tabadol password | إعادة تعيين كلمة المرور';
  const html = `
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
  `;
  await sendViaBrevoAPI(user.email, user.firstName, subject, html);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
