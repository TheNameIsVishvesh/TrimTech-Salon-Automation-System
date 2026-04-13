require('dotenv').config();
const { sendBookingEmail } = require('./utils/emailService');

async function test() {
  console.log('Testing email... Using USER:', process.env.EMAIL_USER);
  const emailData = {
    serviceName: 'Test Service',
    date: new Date(),
    time: '10:00',
    employeeName: 'Test Employee'
  };
  await sendBookingEmail('trimtechsalon@gmail.com', emailData); // Sending to themselves to check
}

test().then(() => console.log('Test complete.')).catch(console.error);
