const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
  return res.status(401).json({
    success: false,
    error: "No authorization header provided",
  });

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (token === "admin123") {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid authentication token",
    });
  }
};

// @route   GET /api/properties
// @desc    Get all active properties
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Price range filtering
    if (req.query.minPrice) {
      filter.price = { ...filter.price, $gte: parseInt(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: parseInt(req.query.maxPrice) };
    }

    // Location filtering
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: "i" };
    }

    // Search in title and description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Get properties with pagination
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching properties",
    });
  }
});

// @route   GET /api/properties/:id

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).select("-__v");

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    if (!property.isActive) {
      return res.status(404).json({
        success: false,
        error: "Property is not available",
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while fetching property",
    });
  }
});

// @route   POST /api/properties

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { title, price, location, image, description } = req.body;

    // Validation
    if (!title || !price || !location || !description) {
      return res.status(400).json({
        success: false,
        error:
          "Please provide all required fields: title, price, location, description",
      });
    }

    // Create new property
    const newProperty = new Property({
      title: title.trim(),
      price: parseInt(price),
      location: location.trim(),
      image: image || undefined, // Will use default from schema
      description: description.trim(),
      createdBy: "admin",
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      success: true,
      data: savedProperty,
      message: "Property created successfully",
    });
  } catch (error) {
    console.error("Error creating property:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while creating property",
    });
  }
});
}

module.exports = router;
