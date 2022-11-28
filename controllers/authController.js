const userController = require("./userController");
const { hashPassword } = require("../utils/crypto");

const credentialsAreValid = async (username, password) => {
  const user = await userController.getUser(username);
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
  credentialsAreValid,
  authenticationMiddleware,
};
