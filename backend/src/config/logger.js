const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Errors alag file mein save honge
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Sab logs (info + error) ek combined file mein
    new winston.transports.File({ filename: "logs/combined.log" }),
    // Terminal mein bhi dikhte rahenge (development ke liye)
    new winston.transports.Console(),
  ],
});

module.exports = logger;