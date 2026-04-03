import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = (verifyLink, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `Hello!\n\nPlease verify your email by clicking the link below:\n${verifyLink}\n\nThanks`,
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.log("email error:", error.message);
      return;
    }
    console.log("email send successfuly");
  });
}
