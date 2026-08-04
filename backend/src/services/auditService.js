const AuditLog = require("../models/AuditLog");

const logActivity = async (userId, action, details) => {
  try {
    await AuditLog.create({
      user: userId,
      action: action,
      details: details,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = { logActivity };