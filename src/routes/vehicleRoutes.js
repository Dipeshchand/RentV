const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const { authorization } = require("../middleware/roleMiddleware");
const { addVehicle, getAllVehicles } = require("../controllers/vehicleController");


const router = express.Router();

//Owner adds
router.post("/add",protect,authorization("owner"),addVehicle);

router.get("/", getAllVehicles);

module.exports = router;