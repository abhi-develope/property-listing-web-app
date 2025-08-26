const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Property price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Property location is required"],
      trim: true,
      maxlength: [200, "Location cannot be more than 200 characters"],
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop",
      validate: {
        validator: function (v) {
          // Basic URL validation
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/.test(v) || v === "";
        },
        message: "Please provide a valid image URL",
      },
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  }
);

// Create indexes for better query performance
PropertySchema.index({ location: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ createdAt: -1 });

// Virtual for formatted price
PropertySchema.virtual("formattedPrice").get(function () {
  return `₹${this.price.toLocaleString("en-IN")}`;
});

// Method to get property summary
PropertySchema.methods.getSummary = function () {
  return {
    id: this._id,
    title: this.title,
    price: this.price,
    location: this.location,
    image: this.image,
  };
};

// Static method to get active properties
PropertySchema.statics.getActiveProperties = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Property", PropertySchema);
