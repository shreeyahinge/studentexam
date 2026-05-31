const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentName: String,
  email: String,
  score: Number,
  total: Number,
  answers: Array
});

module.exports = mongoose.model("Result", resultSchema);