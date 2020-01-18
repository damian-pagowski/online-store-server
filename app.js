require("dotenv").config();
const express = require("express");
const Cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const SK_STRIPE = process.env.SK_STRIPE;
const stripe = require("stripe")(SK_STRIPE);
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const session = require('express-session');
const app = express();
app.use(session({secret: 'secret',saveUninitialized: true,resave: true}));

// app.use(session({secret: 'secret'}));

// handlebars midleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// set static folder
app.use(express.static(`${__dirname}/public`));
// cors
app.use(Cors());
// helmet
app.use(helmet());

//routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cart", cartRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// run server
const SERVER_PORT = process.env.PORT || 3030;
app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
module.exports = app;
