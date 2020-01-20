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
    (req, username, password, done) => {
      console.log(username);
      const email = req.body.email;
      console.log("Passport > Email: " + email);
      try {
        Users.findOne({ email }).then(user => {
          if (user != null) {
            console.log("user already exists");
            return done(null, false, {
              message: "user already exists",
            });
          }
          Users.createUser(new Users({ email, password })).then(user => {
            {
              console.log("createUser => " + user);
              return done(null, user);
            }
          });
        });
      } catch (err) {
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
    (username, password, done) => {
      console.log("local stategy LOGIN called");
      Users.findOne({ email: username }).then(user => {
        if (!user) {
          console.log("User not found");
          return done(null, false);
        }
        if (!user.verifyPassword(password)) {
          console.log("invalid password");
          return done(null, false);
        }
        console.log("user found. password OK");
        console.log("returning user" + JSON.stringify(user));
        return done(null, user);
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Users.findOne({ _id: id }, function(err, user) {
    done(err, user);
  });
});
