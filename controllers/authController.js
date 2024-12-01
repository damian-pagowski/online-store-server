const { getUser } = require("./userController");
const { hashPassword } = require("../utils/crypto");

const credentialsAreValid = async (username, password) => {
  const user = await getUser(username);
  if (!user) return false;
  return hashPassword(password) === user.password;
};

const parseAuthorizationHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    throw new Error("Invalid or missing Authorization header");
  }

  const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
  const [username, password] = credentials.split(":");

  if (!username || !password) {
    throw new Error("Invalid credentials format");
  }

  return { username, password };
};

const authenticationMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const { username, password } = parseAuthorizationHeader(authHeader);

    const validCredentials = await credentialsAreValid(username, password);
    if (!validCredentials) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.currentuser = username;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || "Unauthorized" });
  }
};

module.exports = {
  credentialsAreValid,
  authenticationMiddleware,
};