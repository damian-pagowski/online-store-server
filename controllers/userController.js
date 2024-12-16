const Users = require("../models/user");
const { NotFoundError, ValidationError, DatabaseError, UnauthorizedError } = require('../utils/errors');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../utils/token');

const registerUserHandler = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('Username or email already exists', ['username', 'email']);
    }
    const hashedPassword = hashPassword(password);
    const newUser = new Users({ username, email, password: hashedPassword });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({ message: 'User created successfully', username, email, token });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message, errors: error.errors });
    } else {
      throw new DatabaseError('Failed to create user', error);
    }
  }
};

const getUserHandler = async (req, res) => {
  const username = req.currentUser.username;
  try {
    const user = await Users.findOne({ username }, { _id: 0, __v: 0, password: 0 });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      throw new DatabaseError('Failed to get user', error);
    }
  }
};

const deleteUserHandler = async (req, res) => {
  const username = req.currentUser.username;
  try {
    const result = await Users.findOneAndDelete({ username });
    if (!result) {
      throw new NotFoundError('User not found');
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      throw new DatabaseError('Failed to delete user', error);
    }
  }
};

const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUser(username)
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    const passwordValid = verifyPassword(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', username, email: user.email, token });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
    } else {
      throw new DatabaseError('Failed to login', error);
    }
  }
};

function getUser(username) {
  return Users.findOne({ username });
};

module.exports = { 
  registerUserHandler, 
  getUserHandler, 
  deleteUserHandler, 
  loginHandler,
  getUser
};