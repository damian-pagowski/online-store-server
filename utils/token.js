const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


const generateToken = (user) => {
  console.error("generateToken "+ JWT_SECRET)
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
};


const verifyToken = (token) => {
  console.error("verifyToken "+ JWT_SECRET)
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };