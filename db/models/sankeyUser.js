const mongoose = require("mongoose");

const sankeyUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneno: {
    type: Number,
    required: true,
  },
  userType: {
    type: String,
    default: "Normal",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("sankeyUser", sankeyUserSchema);

// username,firstname, lastname, email, password, address, phoneno, userType
