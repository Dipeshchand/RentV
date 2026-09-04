const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const { authorization } = require("../middleware/roleMiddleware");
const { addVehicle, getAllVehicles } = require("../controllers/vehicleController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

//Owner adds
router.post("/add",protect,authorization("owner"),
 upload.array("images", 5),addVehicle);

router.get("/", getAllVehicles);

module.exports = router;