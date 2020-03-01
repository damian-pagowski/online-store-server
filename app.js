require("dotenv").config();
const express = require("express");
const Cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const SK_STRIPE = process.env.SK_STRIPE;
const stripe = require("stripe")(SK_STRIPE);
const exphbs = require("express-handlebars");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const cartRouter = require("./routes/cart");
const productRouter = require("./routes/products");

const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

const app = express();
// session
app.use(session({ secret: "secret", saveUninitialized: true, resave: true }));
//passport
require("./config/passport");
app.use(passport.initialize());
// handlebars midleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// set static folder
app.use(express.static(`${__dirname}/public`));
// cors
// app.use(Cors());

app.use(Cors({

  credentials: true // enable set cookie
}));

// helmet
app.use(helmet());

//routes
app.use("/", indexRouter);
app.use("/users", usersRouter(passport));
app.use("/cart", cartRouter);
app.use("/products", productRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// db connection
const DB_URI = process.env.MONGOLAB_URI;
console.log(`Connecting to database:  ${DB_URI}`);
mongoose.set("useFindAndModify", false);
mongoose
  .connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .catch(error => console.log(error));
// run server
const SERVER_PORT = process.env.PORT || 3030;
app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
module.exports = app;
