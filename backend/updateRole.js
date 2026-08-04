require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const updateRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const result = await User.findOneAndUpdate(
      { email: "neha@test.com" },
      { role: "librarian" },
      { new: true }
    );

    console.log("Updated user:", result);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

updateRole();