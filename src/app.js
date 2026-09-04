const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
// const { protect } = require("./middleware/authMiddleware");
// const { authorization  } = require("./middleware/roleMiddleware")

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "RentV backend is running" });
});

app.use("/api/bookings", require("./routes/bookingRoutes"))

// API routes  
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

module.exports = app;