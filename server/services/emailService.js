const { Resend } = require('resend');
const fs = require('fs');

/**
 * Lazy initialization of Resend client to prevent server crash on boot
 * if the environment variable is missing. It will throw when actually used,
 * which will be caught gracefully by controller try/catch blocks.
 */
const getResendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Strictly enforcing requirement: throw error if API key is missing
    throw new Error('RESEND_API_KEY is not set in environment variables.');
  }
  // Strictly enforcing requirement: NO fallback keys, NO hardcoded secrets
  return new Resend(key);
};

// Default sender email (update when you have a verified domain on Resend)
const SENDER_EMAIL = 'onboarding@resend.dev';

/**
 * Send Booking Confirmation Email
 */
exports.sendBookingEmail = async (to, bookingData) => {
  try {
    const resend = getResendClient();
    
    const { data, error } = await resend.emails.send({
      from: `TrimTech Salon <${SENDER_EMAIL}>`,
      to,
      subject: 'TrimTech Salon - Booking Confirmation',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4CAF50; margin: 0;">TrimTech Salon</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333333; margin-top: 0; text-align: center;">Booking Confirmed!</h2>
            <p style="color: #555555; line-height: 1.6;">Dear Customer,</p>
            <p style="color: #555555; line-height: 1.6;">Your appointment has been successfully booked. Details are listed below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border-radius: 5px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777; width: 35%;"><strong>Service:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.serviceName || 'Standard Service'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777;"><strong>Date:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.date ? new Date(bookingData.date).toDateString() : 'TBD'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777;"><strong>Time:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.time || 'TBD'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; color: #777777;"><strong>Professional:</strong></td>
                <td style="padding: 12px 15px; color: #333333;">${bookingData.employeeName || 'Staff Member'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #777777; text-align: center; margin-top: 30px; font-size: 14px;">We look forward to providing you with excellent service!<br/>The TrimTech Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error (Booking Email):', error);
      throw new Error(error.message);
    }
    
    console.log('Booking email sent successfully via Resend API. ID:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send booking email:', error.message);
    throw error;
  }
};

/**
 * Send Invoice Email (with optional PDF attachment)
 */
exports.sendInvoiceEmail = async (to, invoiceData) => {
  try {
    const resend = getResendClient();
    
    const feedbackLink = `${process.env.CLIENT_URL || 'https://trim-tech-salon-automation-system.vercel.app'}/feedback/${invoiceData.appointmentId || ''}`;
    
    const attachments = [];
    if (invoiceData.filePath && fs.existsSync(invoiceData.filePath)) {
      const fileContent = fs.readFileSync(invoiceData.filePath);
      attachments.push({
        filename: 'TrimTech_Invoice.pdf',
        content: fileContent
      });
    }

    const { data, error } = await resend.emails.send({
      from: `TrimTech Salon <${SENDER_EMAIL}>`,
      to,
      subject: 'TrimTech Salon - Your Invoice & Leave Feedback',
      attachments: attachments.length > 0 ? attachments : undefined,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4CAF50; margin: 0;">TrimTech Salon</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333333; margin-top: 0; text-align: center;">Thank you for your visit!</h2>
            <p style="color: #555555; line-height: 1.6;">Dear Customer,</p>
            <p style="color: #555555; line-height: 1.6;">We hope you enjoyed your recent service at TrimTech Salon. Please find your detailed invoice attached to this email.</p>
            
            <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee;">
              <h3 style="color: #333333; margin-bottom: 15px;">Rate your experience</h3>
              <p style="color: #555555; font-size: 14px; margin-bottom: 20px;">We value your feedback. Please take a moment to let us know how we did.</p>
              <a href="${feedbackLink}" style="display: inline-block; padding: 12px 25px; color: #ffffff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold;">Leave Feedback</a>
            </div>
          </div>
          <p style="color: #777777; text-align: center; margin-top: 30px; font-size: 14px;">We hope to see you again soon!<br/>The TrimTech Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error (Invoice Email):', error);
      throw new Error(error.message);
    }
    
    console.log('Invoice email sent successfully via Resend API. ID:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send invoice email:', error.message);
    throw error;
  }
};

/**
 * Send OTP / Reset Token Email
 */
exports.sendOtpEmail = async (to, otp) => {
  try {
    const resend = getResendClient();
    
    const { data, error } = await resend.emails.send({
      from: `TrimTech Security <${SENDER_EMAIL}>`,
      to,
      subject: 'TrimTech Salon - Security Verification',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4CAF50; margin: 0;">TrimTech Salon</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #333333; margin-top: 0;">Authentication Required</h2>
            <p style="color: #555555; line-height: 1.6; margin-bottom: 20px;">Please use the security code or secure link below to verify your account.</p>
            
            <div style="display: inline-block; padding: 15px 30px; background-color: #ffffff; border: 2px dashed #4CAF50; border-radius: 5px; margin: 10px 0; word-break: break-all;">
              <span style="font-size: 20px; font-weight: bold; color: #333333;">
                ${otp.startsWith('http') ? `<a href="${otp}" style="color: #4CAF50; text-decoration: none;">Secure Access Link</a>` : otp}
              </span>
            </div>
            
            <p style="color: #777777; font-size: 13px; margin-top: 25px;">If you did not request this verification, please ignore this email to keep your account secure.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error (OTP Email):', error);
      throw new Error(error.message);
    }
    
    console.log('OTP verification email sent successfully via Resend API. ID:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    throw error;
  }
};
