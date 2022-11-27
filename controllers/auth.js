const crypto = require("crypto");
const Users = require("../models/user");

const hashPassword = (password) => {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
};

const credentialsAreValid = async (username, password) => {
  const user = await Users.findOne({ username });
  if (!user) return false;
  return hashPassword(password) === user.password;
};

const authenticationMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const credentials = Buffer.from(
      authHeader.slice("basic".length + 1),
      "base64"
    ).toString();
    const [username, password] = credentials.split(":");

    const validCredentialsSent = await credentialsAreValid(username, password);
    if (!validCredentialsSent) throw new Error("invalid credentials");
    req.currentuser = username;
  } catch (e) {
    return res
      .status(401)
      .json({ message: "please provide valid credentials" });
  }
  next();
};

module.exports = {
  hashPassword,
  credentialsAreValid,
  authenticationMiddleware,
};
