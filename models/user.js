const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { hash, compareSync } = require("bcryptjs");

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  displayName: { type: String, required: false },
  defaultProject: { type: String, required: false, default: "test" },
});

userSchema.methods.verifyPassword = function(password) {
  return compareSync(password, this.password);
};

userSchema.static("createUser", function(newUser) {
  return hash(newUser.password, 10).then(hash => {
    newUser.password = hash;
    return newUser.save();
  });
});

userSchema.static("hashPassword", function(password) {
  return hash(password, 10);
});

module.exports = mongoose.model("User", userSchema);
