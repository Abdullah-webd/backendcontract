const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email not sent - transporter not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL_TO || 'admin@petrotech.com',
      subject: 'New Contact Form Submission - PetroTech Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${contactData.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;">
              <strong>Note:</strong> Please respond to this inquiry within 24 hours for the best customer experience.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendContactEmail
};