const jwt = require("jsonwebtoken");
const Users = require("../models/user");
const { hashPassword } = require("../utils/crypto");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; 

const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
};

const findUserByFields = async (fields) => {
  return Users.findOne(fields);
};

const validateUserExistence = async (username, email) => {
  const existingUser = await findUserByFields({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    const errors = [];
    if (existingUser.email === email) errors.push("Email already registered");
    if (existingUser.username === username) errors.push("Username already registered");

    const error = new Error("Validation error");
    error.errors = errors;
    throw error;
  }
};

const getUser = async (username, mask = {}) => {
  return Users.findOne({ username }).select(mask);
};

const deleteUser = async (username) => {
  return Users.findOneAndDelete({ username });
};

const createUser = async (username, email, password) => {
  await validateUserExistence(username, email);

  const hashedPassword = hashPassword(password);
  const newUser = new Users({ username, email, password: hashedPassword });
  await newUser.save();

  const token = generateToken(newUser);
  return {
    message: "User created successfully",
    token,
    username: newUser.username,
    email: newUser.email,
  };
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

  const token = generateToken(user);

  return {
    message: "Login successful",
    token,
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