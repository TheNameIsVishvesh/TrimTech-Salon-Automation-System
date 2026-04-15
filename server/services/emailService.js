const { Resend } = require('resend');

// Verify RESEND_API_KEY is available
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("Warning: RESEND_API_KEY is not set in environment variables");
}

// Resend throws if the string is completely empty, so provide a fallback purely to let the app start
const resend = new Resend(resendApiKey || 're_missingkey');

// A default sender email - must be verified in Resend dashboard
const senderEmail = 'onboarding@resend.dev'; // Resend's default testing domain

/**
 * Send Booking Confirmation Email
 */
exports.sendBookingEmail = async (to, bookingData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `TrimTech Salon <${senderEmail}>`,
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
            <p style="color: #555555; line-height: 1.6;">Your appointment has been successfully booked. We've listed the details below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border-radius: 5px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777; width: 40%;"><strong>Service:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.serviceName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777;"><strong>Date:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.date ? new Date(bookingData.date).toDateString() : 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #777777;"><strong>Time:</strong></td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; color: #333333;">${bookingData.time || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; color: #777777;"><strong>Professional:</strong></td>
                <td style="padding: 12px 15px; color: #333333;">${bookingData.employeeName || 'N/A'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #777777; text-align: center; margin-top: 30px; font-size: 14px;">We look forward to seeing you!<br/>The TrimTech Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend booking email error:', error);
      throw error;
    }
    
    console.log('Booking email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendBookingEmail:', error);
    throw error;
  }
};

/**
 * Send Invoice Email
 * Attachments are supported by Resend via content (Buffer or base64)
 */
exports.sendInvoiceEmail = async (to, invoiceData) => {
  try {
    // invoiceData typically contains { filePath, appointmentId, ... } or similar
    const feedbackLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/feedback/${invoiceData.appointmentId || ''}`;
    
    // We optionally handle local file attachments if Resend needs them.
    // Since Resend requires attachment content or path url, we can pass path directly if it's hosted, 
    // or read the local file using fs. Assuming Resend SDK handles local paths via fs reading if required, 
    // but typically it needs 'content' as Buffer. 
    // For simplicity, we will load the file via fs if filePath is provided.
    const attachments = [];
    if (invoiceData.filePath) {
      const fs = require('fs');
      if (fs.existsSync(invoiceData.filePath)) {
        const fileContent = fs.readFileSync(invoiceData.filePath);
        attachments.push({
          filename: 'Invoice.pdf',
          content: fileContent
        });
      }
    }

    const { data, error } = await resend.emails.send({
      from: `TrimTech Salon <${senderEmail}>`,
      to,
      subject: 'TrimTech Salon - Your Invoice & Feedback',
      attachments: attachments.length > 0 ? attachments : undefined,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4CAF50; margin: 0;">TrimTech Salon</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333333; margin-top: 0; text-align: center;">Thank you for your visit!</h2>
            <p style="color: #555555; line-height: 1.6;">Dear Customer,</p>
            <p style="color: #555555; line-height: 1.6;">We hope you enjoyed your service at TrimTech Salon. Please find your invoice attached to this email.</p>
            
            <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee;">
              <h3 style="color: #333333; margin-bottom: 15px;">Rate your experience</h3>
              <p style="color: #555555; font-size: 14px; margin-bottom: 20px;">We would love to hear your feedback to help us improve.</p>
              <a href="${feedbackLink}" style="display: inline-block; padding: 12px 25px; color: #ffffff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">Leave Feedback</a>
            </div>
          </div>
          <p style="color: #777777; text-align: center; margin-top: 30px; font-size: 14px;">We hope to see you again soon!<br/>The TrimTech Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend invoice email error:', error);
      throw error;
    }
    
    console.log('Invoice email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendInvoiceEmail:', error);
    throw error;
  }
};

/**
 * Send OTP / Reset Email
 */
exports.sendOtpEmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `TrimTech Security <${senderEmail}>`,
      to,
      subject: 'TrimTech Salon - Security Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4CAF50; margin: 0;">TrimTech Salon</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #333333; margin-top: 0;">Authentication Required</h2>
            <p style="color: #555555; line-height: 1.6; margin-bottom: 20px;">Use the security code below or follow the secure link to continue.</p>
            
            <div style="display: inline-block; padding: 15px 30px; background-color: #ffffff; border: 2px dashed #4CAF50; border-radius: 5px; margin: 10px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #333333; letter-spacing: 2px;">
                <!-- If otp is a link, we place it in an anchor, otherwise we display as text -->
                ${otp.startsWith('http') ? `<a href="${otp}" style="color: #4CAF50; font-size: 16px; word-break: break-all;">Reset link</a>` : otp}
              </span>
            </div>
            
            <p style="color: #777777; font-size: 13px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend OTP email error:', error);
      throw error;
    }
    
    console.log('OTP/Reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in sendOtpEmail:', error);
    throw error;
  }
};
