var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  let username;
  try {
    username = req.session.user.displayName;
  } catch (error) {
    console.log("cannot set username yet " + error);
  }
  console.log("session :" + JSON.stringify(req.session));
  res.render("index", { username });
});

module.exports = router;
