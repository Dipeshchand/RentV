const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicleName: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooty", "car"],
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    numberPlate: {
      type: String,
      required: true,
    },

    pricePerHour: {
      type: Number,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

//Indexes 
vehicleSchema.index({isAvailable:1});
vehicleSchema.index({ isAvailable: 1, vehicleType: 1 });
module.exports = mongoose.model("Vehicle", vehicleSchema);
