const express = require("express");
const router = express.Router();
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
            res.status(401).send(info.message);
          } else {
            res.status(403).send(info.message);
          }
        }
        if (!user) {
          res.status(404).send("user not found");
        }
        req.session.user = user;
        req.session.save(err => console.log("error while /login" + err));
        res.redirect("/");
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
            res.status(200).json({
              data: user,
            });
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
}