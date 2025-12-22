const Vehicle = require("../models/Vehicle");

// Add a new vehicle (Owner only)
exports.addVehicle = async (req, res) => {
  try {
    const { vehicleName, vehicleType, model, numberPlate, pricePerHour, image } = req.body;

    if (!vehicleName || !vehicleType || !model || !numberPlate || !pricePerHour) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      vehicleName,
      vehicleType,
      model,
      numberPlate,
      pricePerHour,
      image: image || "",
    });

    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle
    });

  } catch (error) {
    console.error("Add Vehicle Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all available vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true }).populate("owner", "name phone");

    res.json(vehicles);

  } catch (error) {
    console.error("Fetch Vehicles Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
