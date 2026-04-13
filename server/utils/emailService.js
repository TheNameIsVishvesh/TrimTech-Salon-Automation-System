const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendBookingEmail = async (to, data) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'TrimTech Salon - Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">TrimTech Salon</h2>
          <h3 style="text-align: center;">Booking Confirmation</h3>
          <p>Dear Customer,</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(data.date).toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Employee:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.employeeName}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; text-align: center;">Thank you for choosing TrimTech!</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log('Booking email sent successfully');
  } catch (error) {
    console.error('Error sending booking email:', error);
  }
};

exports.sendInvoiceEmail = async (to, filePath, appointmentId) => {
  try {
    const feedbackLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/feedback/${appointmentId}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'TrimTech Salon - Your Invoice & Feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">TrimTech Salon</h2>
          <p>Dear Customer,</p>
          <p>Thank you for visiting TrimTech Salon. Please find your invoice attached to this email.</p>
          <p><strong>Rate your experience with TrimTech!</strong></p>
          <p>We would love to hear your feedback. Please click the link below to leave a review:</p>
          <p style="text-align: center;">
            <a href="${feedbackLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Leave Feedback</a>
          </p>
          <p style="margin-top: 20px; text-align: center;">We hope to see you again soon!</p>
        </div>
      `,
      attachments: [
        {
          filename: 'Invoice.pdf',
          path: filePath
        }
      ]
    };
    await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully');
  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};

exports.sendResetEmail = async (to, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'TrimTech Salon - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">TrimTech Salon</h2>
          <p>You requested a password reset.</p>
          <p>Please click the link below to set a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
