const { Resend } = require("resend");
const fs = require("fs");

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "TrimTech <onboarding@resend.dev>";

const sendEmail = async (options) => {
  try {
    return await resend.emails.send({
      from: FROM_EMAIL,
      ...options,
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
    throw err;
  }
};

const baseTemplate = (content) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #5a67d8;">
    <h1 style="color: #5a67d8; margin: 0;">TrimTech Salon</h1>
  </div>
  <div style="padding: 20px 0; color: #333; line-height: 1.6;">
    ${content}
  </div>
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #777;">
    <p>&copy; 2025 TrimTech Salon Management System. All rights reserved.</p>
  </div>
</div>
`;

exports.sendBookingEmail = (to, data) => {
  const content = `
    <h2 style="color: #2d3748;">Booking Confirmed! ✔</h2>
    <p>Hi ${data.customerName || 'there'},</p>
    <p>Your appointment has been successfully booked. Here are the details:</p>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Service:</strong> ${data.serviceName}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
    </div>
    <p>We look forward to seeing you!</p>
  `;
  return sendEmail({
    to,
    subject: "Booking Confirmed - TrimTech",
    html: baseTemplate(content),
  });
};

exports.sendInvoiceEmail = (to, data, attachmentPath = null) => {
  const attachments = [];
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    const pdfBuffer = fs.readFileSync(attachmentPath);
    attachments.push({
      filename: "Invoice.pdf",
      content: pdfBuffer.toString("base64"),
    });
  }

  const content = `
    <h2 style="color: #2d3748;">Invoice for Your Service</h2>
    <p>Thank you for choosing TrimTech! Please find your invoice details below.</p>
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${data.invoiceNumber || 'N/A'}</p>
      <p style="margin: 5px 0; font-size: 18px; color: #5a67d8;"><strong>Total Amount:</strong> ₹${data.amount}</p>
    </div>
    <p>An invoice PDF has been attached to this email for your records.</p>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${data.invoiceNumber || ''} from TrimTech`,
    html: baseTemplate(content),
    attachments,
  });
};

exports.sendOtpEmail = (to, otpOrUrl) => {
  const isUrl = otpOrUrl.startsWith('http');
  const content = `
    <h2 style="color: #2d3748;">${isUrl ? 'Reset Your Password' : 'OTP Verification'}</h2>
    <p>${isUrl ? 'Click the button below to reset your password. This link is valid for 15 minutes.' : 'Use the OTP below to verify your account.'}</p>
    <div style="text-align: center; margin: 30px 0;">
      ${isUrl 
        ? `<a href="${otpOrUrl}" style="background-color: #5a67d8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>`
        : `<div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #5a67d8; background: #f7fafc; padding: 10px; border-radius: 5px; display: inline-block;">${otpOrUrl}</div>`
      }
    </div>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject: isUrl ? "Password Reset Request" : "Your OTP Code",
    html: baseTemplate(content),
  });
};

