const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

// Student creates booking
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { vehicleId, startTime, endTime } = req.body;

    // 1. Validate required fields
    if (!vehicleId || !startTime || !endTime) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Convert dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 3. Validate date format
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // 4. Validate time range
    if (end <= start) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    // 5. Calculate rental hours
    const hours =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60);

    let booking;

    // 6. Start transaction
    await session.withTransaction(async () => {

      // 6.1 Create a write on the vehicle.
      // This acts as the serialization point for
      // concurrent booking requests for the same vehicle.
      const vehicleUpdate = await Vehicle.updateOne(
        { _id: vehicleId },
        { $inc: { bookingVersion: 1 } },
        { session }
      );

      // Vehicle doesn't exist
      if (vehicleUpdate.matchedCount === 0) {
        throw new Error("VEHICLE_NOT_FOUND");
      }

      // 6.2 Get the vehicle
      const vehicle = await Vehicle.findById(vehicleId)
        .populate("owner")
        .session(session);

      // 6.3 Check for overlapping bookings
      const conflictingBooking = await Booking.findOne({
        vehicle: vehicleId,

        // Pending and accepted bookings occupy the time slot
        status: {
          $in: ["pending", "accepted"],
        },

        // Existing booking starts before
        // requested booking ends
        startTime: {
          $lt: end,
        },

        // Existing booking ends after
        // requested booking starts
        endTime: {
          $gt: start,
        },
      }).session(session);

      if (conflictingBooking) {
        throw new Error("BOOKING_CONFLICT");
      }

      // 6.4 Calculate total price
      const totalAmount = Math.ceil(
        hours * vehicle.pricePerHour
      );

      // 6.5 Create booking
      const createdBookings = await Booking.create(
        [
          {
            student: req.user._id,
            owner: vehicle.owner._id,
            vehicle: vehicle._id,
            startTime: start,
            endTime: end,
            totalAmount,
            status: "pending",
          },
        ],
        { session }
      );

      booking = createdBookings[0];
    });

    // 7. Transaction successful
    return res.status(201).json({
      message: "Booking request created",
      booking,
    });

  } catch (error) {

    // Vehicle not found
    if (error.message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    // Time slot already occupied
    if (error.message === "BOOKING_CONFLICT") {
      return res.status(409).json({
        message: "Vehicle is already booked for this time slot",
      });
    }

    console.error("Create Booking Error:", error);

    return res.status(500).json({
      message: "Server error",
    });

  } finally {
    // 8. Always close the session
    await session.endSession();
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
      booking,
    });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
