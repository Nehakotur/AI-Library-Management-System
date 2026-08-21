const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const newspaperRoutes = require("./routes/newspaperRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const anomalyRoutes = require("./routes/anomalyRoutes");
const qmsRoutes = require("./routes/qmsRoutes");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(cors());
app.use(express.json());

// Rate Limiter - 15 minute mein max 100 requests per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    message: "AI Library Management System API Running 🚀",
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/v1/newspapers", newspaperRoutes);
app.use("/api/newspapers", newspaperRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/v1/anomalies", anomalyRoutes);
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/v1/qms", qmsRoutes);
app.use("/api/qms", qmsRoutes);

// Backward compatibility - purane URLs bhi chalte rahenge
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);


// Error Handler - hamesha sabse aakhri mein hona chahiye
app.use(errorHandler);
module.exports = app;