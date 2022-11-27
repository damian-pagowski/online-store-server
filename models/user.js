const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
userSchema.static("createUser", function (newUser) {
  return newUser.save();
});

module.exports = mongoose.model("User", userSchema);
