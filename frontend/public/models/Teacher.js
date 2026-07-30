const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  subject: String,
  classes: [String],
});

module.exports = mongoose.model("Teacher", teacherSchema);