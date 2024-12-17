const { registerUser, getUserByUsername, deleteUserByUsername, loginUser } = require('../services/userService');

const registerUserHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await registerUser(username, email, password);
    res.status(201).json({ message: 'User created successfully', ...user });
  } catch (error) {
    next(error); 
  }
};

const getUserHandler = async (req, res, next) => {
  const username = req.currentUser.username;
  try {
    const user = await getUserByUsername(username);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUserHandler = async (req, res, next) => {
  const username = req.currentUser.username;
  try {
    await deleteUserByUsername(username);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const loginHandler = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await loginUser(username, password);
    res.status(200).json({ message: 'Login successful', ...user });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  registerUserHandler, 
  getUserHandler, 
  deleteUserHandler, 
  loginHandler 
};