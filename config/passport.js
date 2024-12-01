const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("../models/user");

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
      session: false,
    },
    async (req, username, password, done) => {
      try {
        const email = req.body.email;
        console.log(`Passport > Register > Email: ${email}`);

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
          console.log("User already exists");
          return done(null, false, { message: "User already exists" });
        }

        const newUser = await Users.create({ email, password });
        console.log(`User created: ${newUser}`);
        return done(null, newUser);
      } catch (err) {
        console.error("Error during registration:", err);
        return done(err);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        console.log("Passport > Login > Attempting login");

        const user = await Users.findOne({ email: username });
        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "User not found" });
        }

        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
          console.log("Invalid password");
          return done(null, false, { message: "Invalid password" });
        }

        console.log("User authenticated successfully");
        return done(null, user);
      } catch (err) {
        console.error("Error during login:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;