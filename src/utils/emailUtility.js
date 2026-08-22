const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Read the header and footer HTML templates
const headerTemplate = fs.readFileSync(path.join(__dirname, "..", "templates", "email-header.html"), "utf-8");
const footerTemplate = fs.readFileSync(path.join(__dirname, "..", "templates", "email-footer.html"), "utf-8");

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Utility function to send HTML emails with common header and footer
const sendEmail = (to, subject, htmlContent, attachments) => {
  const fullHtmlContent = headerTemplate + htmlContent + footerTemplate;

  // FIX: Use EMAIL_FROM env var instead of hardcoded 'your-email@gmail.com'
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || "noreply@jhatkabyte.com";

  const mailOptions = {
    from: fromAddress,
    to: to,
    subject: subject,
    html: fullHtmlContent,
    attachments: attachments ? attachments : null,
  };

  return transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log("Email sent:", info.response);
      return info;
    })
    .catch((error) => {
      console.log("Error sending email:", error);
      throw error;
    });
};

module.exports = sendEmail;
