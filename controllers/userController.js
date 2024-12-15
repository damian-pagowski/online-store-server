const jwt = require("jsonwebtoken");
const Users = require("../models/user");
const { hashPassword } = require("../utils/crypto");
const { TokenError, DatabaseError, ValidationError, NotFoundError, AuthenticationError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; 

const generateToken = (user) => {
  try {
    return jwt.sign(
      { username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );
  } catch (error) {
    throw new TokenError(`Failed to generate token for user ${user.username}`, error);
  }
};

const findUserByFields = async (fields) => {
  try {
    return await Users.findOne(fields);
  } catch (error) {
    throw new DatabaseError(`Failed to find user by fields: ${JSON.stringify(fields)}`, error);
  }
};

const validateUserExistence = async (username, email) => {
  const existingUser = await findUserByFields({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    const errors = [];
    if (existingUser.email === email) errors.push(`Email "${email}" already registered`);
    if (existingUser.username === username) errors.push(`Username "${username}" already registered`);
    throw new ValidationError('User validation failed', errors);
  }
};

const getUser = async (username, mask = {}) => {
  try {
    const user = await Users.findOne({ username }).select(mask);
    if (!user) {
      throw new NotFoundError(`User with username "${username}" not found`);
    }
    return user;
  } catch (error) {
    throw new DatabaseError(`Failed to retrieve user with username: ${username}`, error);
  }
};

const deleteUser = async (username) => {
  try {
    const user = await Users.findOneAndDelete({ username });
    if (!user) {
      throw new NotFoundError(`User with username "${username}" not found`);
    }
    return user;
  } catch (error) {
    throw new DatabaseError(`Failed to delete user with username: ${username}`, error);
  }
};

const createUser = async (username, email, password) => {
  try {
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
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; 
    }
    throw new DatabaseError('Failed to create user', 'createUser', { username, email, originalError: error });
  }
};

const login = async (username, password) => {
  const user = await getUser(username);
  if (!user) {
    throw new NotFoundError(`User with username ${username} not found`);
  }
  const hashedInputPassword = hashPassword(password);
  if (user.password !== hashedInputPassword) {
    throw new AuthenticationError('Invalid username or password');
  }
  const token = generateToken(user);
  return { message: "Login successful", token, username: user.username, email: user.email };
};

module.exports = {
  getUser,
  createUser,
  deleteUser,
  login,
};