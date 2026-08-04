const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async (toEmail, studentName, bookTitle, dueDate) => {
  try {
    await transporter.sendMail({
      from: `"Library System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Book Due Date Reminder",
      html: `
        <h3>Hi ${studentName},</h3>
        <p>This is a reminder that your book <strong>"${bookTitle}"</strong> is due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
        <p>Please return it on time to avoid a fine.</p>
        <p>Thank you,<br/>Library Team</p>
      `,
    });
    console.log(`✅ Reminder email sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
  }
};

module.exports = { sendReminderEmail };