require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectDB = require("./src/config/database");
const startReminderCron = require("./src/services/reminderCron");

const PORT = process.env.PORT || 5000;

// Database connect
connectDB();

// Reminder cron job start karo
startReminderCron();

// Express app ko http server ke andar wrap karo
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// io ko poore app mein access karne ke liye global bana do
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});