const { Resend } = require('resend');
// If you have dotenv installed, you can uncomment the line below to load variables from .env
// require('dotenv').config();

// For a quick test, you can paste your actual API key below (e.g., 're_12345...').
// If doing so, DO NOT commit this file to GitHub/version control.
const apiKey = process.env.RESEND_API_KEY || 're_6fPeJBqg_GnQcTH7vcmh5jnbsYU3TYpFL';
const resend = new Resend(apiKey);

async function sendTestEmail() {
  try {
    console.log("Attempting to send Resend test email...");

    const { data, error } = await resend.emails.send({
      from: 'TrimTech <onboarding@resend.dev>',
      // ⚠️ Replace the placeholder below with your personal test email address ⚠️
      to: ['joshivishvesh22@gmail.com'],
      subject: 'Resend Test Email - TrimTech',
      html: '<p><strong>Success!</strong> This is a simple confirmation message from your local testing script to confirm the Resend API works.</p>',
    });

    if (error) {
      console.error("❌ API returned an error:");
      console.dir(error, { depth: null });
      return;
    }

    console.log("✅ Email sent successfully!");
    console.log("Response Data:", data);
  } catch (err) {
    // This catches unexpected network drops, syntax issues, or crash-level errors
    console.error("❌ An unexpected error occurred while sending the email:");
    console.error(err);
  }
}

sendTestEmail();
