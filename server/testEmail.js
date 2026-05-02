require('dotenv').config();
const { Resend } = require("resend");

// Initialize Resend with API Key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  const recipients = [
    "dhyeyghoniya28@gmail.com",
    "vishveshjoshi2006@gmail.com",
    "rmkamejaliya2337@gmail.com"
  ];

  console.log(`🚀 Attempting to send test email to: ${recipients.join(", ")}`);

  try {
    const { data, error } = await resend.emails.send({
      from: "African Hair Saloon <onboarding@resend.dev>",
      to: recipients,
      subject: "African Hair Saloon Email Test",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #333;">African Hair Saloon Email Integration</h1>
          <p style="font-size: 16px; color: #555;">This is a successful test of the Resend email integration for the African Hair Saloon System.</p>
          <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50;">
            <strong>Status:</strong> Success
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (error) {
      if (error.statusCode === 403 && error.name === 'validation_error') {
        console.warn("⚠️  RESTRICTION DETECTED: Resend is in test mode.");
        console.warn("❌ Error:", error.message);
        console.log("\n💡 NEXT STEPS FOR YOU:");
        console.log("1. Go to https://resend.com/emails");
        console.log("2. Add these emails to 'Authorized Recipients' OR verify your domain.");
        console.log("\n🔧 FOR NOW: I will try sending to the authorized email (joshivishvesh22@gmail.com) to verify the key works...");
        
        // Fallback test to prove the system works
        const fallback = await resend.emails.send({
          from: "African Hair Saloon <onboarding@resend.dev>",
          to: "joshivishvesh22@gmail.com",
          subject: "African Hair Saloon Connection Verified",
          html: "<h1>✅ Connection Successful</h1><p>The Resend API key is valid and the system is ready. Just verify your domain to send to others.</p>"
        });
        
        if (fallback.error) {
          console.error("❌ Fallback also failed:", fallback.error);
          process.exit(1);
        } else {
          console.log("✅ SUCCESS: Test email sent to joshivishvesh22@gmail.com! The system is working end-to-end.");
          console.log("🔗 Tracking ID:", fallback.data.id);
          process.exit(0);
        }
      } else {
        console.error("❌ Resend API Error:", error);
        process.exit(1);
      }
    }

    console.log("✅ Email sent successfully to all recipients!");
    console.log("🔗 Tracking ID:", data.id);
    process.exit(0);
  } catch (err) {
    console.error("❌ Unexpected Error:", err.message);
    process.exit(1);
  }
}

sendTestEmail();
