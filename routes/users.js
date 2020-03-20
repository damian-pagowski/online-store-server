const express = require("express");
const router = express.Router();
const Users = require("../models/user");

module.exports = function(passport) {
  return router
    .post("/login", (req, res, next) => {
      passport.authenticate("login", async (err, user, info) => {
        if (err) {
          console.error(`error ${err}`);
        }
        if (info !== undefined) {
          console.error(info.message);
          if (info.message === "bad username") {
            return res.status(401).send(info.message);
          } else {
            return res.status(403).send(info.message);
          }
        }
        if (!user) {
          return res.status(404).send("user not found");
        } else {
          req.session.user = user;
          req.session.save(err => console.log("error while /login" + err));
          res.json({ email: user.email, id: user._id });
        }
      })(req, res, next);
    })
    .post("/register", (req, res, next) => {
      passport.authenticate("register", (err, user, info) => {
        if (err) {
          console.error(err);
          res.status(400).json({ error: err });
        }
        if (info !== undefined) {
          console.error(info.message);
          res.status(403).send(info.message);
        } else {
          req.logIn(user, error => {
            console.log("registration > user: " + user);
            res.status(201).json({ email: user.email, id: user._id });
          });
        }
      })(req, res, next);
    })
    .get("/logout", (req, res, next) => {
      try {
        req.session.cart = null;
        req.session.user = null;
        req.session.save(err =>
          console.log("error while saving session: " + err)
        );
        req.logOut();
        res.json({ message: "logout successful" });
      } catch (error) {
        res.status(400).json({ message: error });
      }
    })

    .delete("/", (req, res, next) => {
      const { email } = req.body;

      try {
        Users.findOneAndRemove({ email }).then(result =>
          res.json({ message: "logout successful", result })
        );
      } catch (error) {
        res.status(400).json({ message: error });
      }
    });
};
