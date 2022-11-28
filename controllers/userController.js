const crypto = require("crypto");
const Users = require("../models/user");
const { hashPassword } = require("../utils/crypto");

const getUser = (username) => {
  return Users.findOne({ username });
};

const deleteUser = (username) => {
  return Users.findOneAndRemove({ username });
};

const createUser = async (username, email, password) => {
  const emailFound = await Users.findOne({ email });
  const usernameFound = await getUser(username);
  if (emailFound || usernameFound) {
    const errors = [
      emailFound && "email already registered",
      usernameFound && "username already registered",
    ];
    const err = new Error();
    err.errors = errors;
    throw err;
  }
  const hashedPassword = hashPassword(password);
  const newUser = new Users({ username, email, password: hashedPassword });
  return newUser.save();
};

module.exports = {
  getUser,
  createUser,
  deleteUser,
};
