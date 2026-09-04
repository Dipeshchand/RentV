const Vehicle = require("../models/Vehicle");
const cloudinary = require("../config/cloudinary");
// Add a new vehicle (Owner only)
exports.addVehicle = async (req, res) => {
  try {

      console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      vehicleName,
      vehicleType,
      model,
      numberPlate,
      pricePerHour,
    } = req.body;

    if (
      !vehicleName ||
      !vehicleType ||
      !model ||
      !numberPlate ||
      !pricePerHour
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload multiple images to Cloudinary
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "rentv/vehicles",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          uploadStream.end(file.buffer);
        });

        imageUrls.push(result.secure_url);
      }
    }
    const vehicle = await Vehicle.create({
      owner: req.user._id,
      vehicleName,
      vehicleType,
      model,
      numberPlate,
      pricePerHour,
      images: imageUrls,
    });

    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Add Vehicle Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all available vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true }).populate(
      "owner",
      "name phone",
    );

    res.json(vehicles);
  } catch (error) {
    console.error("Fetch Vehicles Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
