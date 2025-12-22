const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    collegeName: { type: String, required:true },
    branch: { type: String,  required:true  },
    role: {
      type: String,
      enum: ["student", "owner", "admin"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// -------- PASSWORD HASHING (Mongoose 8 compatible) ----------
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// -------- CHECK PASSWORD MATCH --------
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
