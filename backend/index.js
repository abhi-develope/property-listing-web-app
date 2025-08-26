const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
const propertyRoutes = require("./routes/properties");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/properties", propertyRoutes);

// Basic endpoints
app.get("/", (req, res) => {
  res.json({
    message: "Property Listing API",
    endpoints: {
      "GET /api/properties": "Get all properties",
      "GET /api/properties/:id": "Get single property",
      "POST /api/properties": "Create property (Admin only)",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

module.exports = app;
