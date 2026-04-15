const { Resend } = require("resend");

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

exports.sendBookingEmail = (to, data) => {
  return sendEmail({
    to,
    subject: "Booking Confirmed ✔",
    html: `<h2>Booking Confirmed</h2>
           <p>Service: ${data.serviceName}</p>
           <p>Date: ${data.date}</p>
           <p>Time: ${data.time}</p>`,
  });
};

exports.sendInvoiceEmail = (to, data) => {
  return sendEmail({
    to,
    subject: "Invoice from TrimTech",
    html: `<h2>Invoice</h2>
           <p>Amount: ₹${data.amount}</p>`,
  });
};

exports.sendOtpEmail = (to, otp) => {
  return sendEmail({
    to,
    subject: "OTP Verification",
    html: `<h2>Your OTP</h2><h1>${otp}</h1>`,
  });
};
