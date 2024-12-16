const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const hashPassword = (password) => {
  if (!password) {
    throw new Error('Password must be provided');
  }
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};

const verifyPassword = (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    throw new Error('Password and hashed password must be provided');
  }
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { hashPassword, verifyPassword };