const Users = require("../models/user");
const { hashPassword } = require("../utils/crypto");

const getUser = (username, mask = {}) => {
  return Users.findOne({ username }, mask);
};

const deleteUser = (username) => {
  return Users.findOneAndRemove({ username });
};

const createUser = async (username, email, password) => {
  const existingUser = await Users.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const errors = [];
    if (existingUser.email === email) errors.push("Email already registered");
    if (existingUser.username === username) errors.push("Username already registered");

    const err = new Error("Validation error");
    err.errors = errors;
    throw err;
  }

  const hashedPassword = hashPassword(password);
  const newUser = new Users({ username, email, password: hashedPassword });
  return newUser.save();
};

const login = async (username, password) => {
  const user = await getUser(username);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const hashedInputPassword = hashPassword(password);
  if (user.password !== hashedInputPassword) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  return {
    message: "Login successful",
    username: user.username,
    email: user.email,
  };
};

module.exports = {
  getUser,
  createUser,
  deleteUser,
  login,
};