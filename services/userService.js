const Users = require('../models/user');
const { NotFoundError, ValidationError, DatabaseError, UnauthorizedError } = require('../utils/errors');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../utils/token');

const registerUser = async(username, email, password) => {
  try {
    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('Username or email already exists', ['username', 'email']);
    }

    const hashedPassword = hashPassword(password);
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      role: 'registered_user',
    });

    await newUser.save();

    const token = generateToken(newUser);
    return { username: newUser.username, email: newUser.email, token, role: newUser.role };
  } catch (error) {
    if (error instanceof ValidationError) {throw error;}
    throw new DatabaseError('Failed to register user', error);
  }
};

const getUserByUsername = async(username) => {
  try {
    const user = await Users.findOne({ username }, { _id: 0, __v: 0, password: 0 });
    if (!user) {throw new NotFoundError('User', username);}
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {throw error;}
    throw new DatabaseError(`Failed to get user with username: ${username}`, error);
  }
};

const deleteUserByUsername = async(username) => {
  try {
    const result = await Users.findOneAndDelete({ username });
    if (!result) {throw new NotFoundError('User', username);}
    return result;
  } catch (error) {
    if (error instanceof NotFoundError) {throw error;}
    throw new DatabaseError(`Failed to delete user with username: ${username}`, error);
  }
};

const loginUser = async(username, password) => {
  try {
    const user = await Users.findOne({ username });
    if (!user) {throw new NotFoundError('User', username);}


    const passwordValid = verifyPassword(password, user.password);
    if (!passwordValid) {throw new UnauthorizedError('Invalid credentials');}

    const token = generateToken(user);
    return { username: user.username, email: user.email, token, role: user.role };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {throw error;}

    throw new DatabaseError(`Failed to login user: ${username}`, error);
  }
};

const getUser = async(username) => {
  try {
    const user = await Users.findOne({ username }, { _id: 0, __v: 0, password: 0 });
    if (!user) {
      throw new NotFoundError('User', username);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError){
      throw error;
    }
    throw new DatabaseError('Failed to get user', 'getUser', { username, originalError: error });
  }
};

module.exports = {
  registerUser,
  getUserByUsername,
  deleteUserByUsername,
  loginUser,
  getUser,
};
