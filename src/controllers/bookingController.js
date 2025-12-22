const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

// Student creates booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, startTime, endTime } = req.body;

    if (!vehicleId || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const vehicle = await Vehicle.findById(vehicleId).populate("owner");
    if (!vehicle || !vehicle.isAvailable) {
      return res.status(400).json({ message: "Vehicle not available" });
    }

    const hours =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
      (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const totalAmount = Math.ceil(hours * vehicle.pricePerHour);
    // have to know the meaning of totalAmount that what is this 

    const booking = await Booking.create({
      student: req.user._id,
      owner: vehicle.owner._id,
      vehicle: vehicle._id,
      startTime,
      endTime,
      totalAmount,
    });

    return res.status(201).json({
      message: "Booking request created",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// Owner views all booking requests for their vehicles
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("student", "name phone")
      .populate("vehicle", "vehicleName numberPlate")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Owner Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Owner accepts or rejects booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId).populate("vehicle");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure only the owner can update
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    // If accepted → make vehicle unavailable
    if (status === "accepted") {
      booking.vehicle.isAvailable = false;
      await booking.vehicle.save();
    }

    res.json({
      message: `Booking ${status}`,
      booking
    });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
