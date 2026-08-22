const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "windows",
  logger: false,
});

const sendmail = async (message) => {
  const info = await transporter.sendMail(message);
  return info;
};

module.exports = {
  sendmail,
};
