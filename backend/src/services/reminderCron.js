const cron = require("node-cron");
const Issue = require("../models/Issue");
const { sendReminderEmail } = require("./emailService");

const startReminderCron = () => {
  // Har roz subah 9 baje chalega
  cron.schedule("0 9 * * *", async () => {
    console.log("🔔 Running due date reminder check...");

    try {
      // Aane wale 1 din mein due hone wali books dhoondo
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const now = new Date();

      const dueSoonIssues = await Issue.find({
        status: "issued",
        dueDate: { $gte: now, $lte: tomorrow },
      })
        .populate("user", "name email")
        .populate("book", "title");

      for (const issue of dueSoonIssues) {
        if (issue.user?.email) {
          await sendReminderEmail(
            issue.user.email,
            issue.user.name,
            issue.book?.title,
            issue.dueDate
          );
        }
      }

      console.log(`✅ Checked ${dueSoonIssues.length} books due soon`);
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });

  console.log("⏰ Reminder cron job scheduled (daily at 9 AM)");
};

module.exports = startReminderCron;