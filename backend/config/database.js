const mongoose = require("mongoose");

// MongoDB connection configuration
const connectDB = async () => {
  try {
    // MongoDB connection string - replace with your actual MongoDB URI
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/property-listing";

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI);

    console.log(`connection successful`);

    return conn;
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
  }
};

module.exports = {
  connectDB,
};
