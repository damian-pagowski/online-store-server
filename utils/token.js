const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '12h' },
  );
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch ({ message }) {
    throw new Error(`Invalid or expired token: ${message}`);
  }
};

module.exports = { generateToken, verifyToken };
