const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {authorization } = require("../middleware/roleMiddleware");
const {createBooking, getOwnerBookings, updateBookingStatus} = require("../controllers/bookingController")

const router = express.Router();


// Student creates booking
router.post("/create",protect,authorization("student"), createBooking);


router.get("/owner", protect, authorization("owner"), getOwnerBookings)

router.put("/update-status", protect, authorization("owner"), updateBookingStatus)


module.exports = router;
