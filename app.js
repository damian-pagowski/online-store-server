require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const usersRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");
const productRouter = require("./routes/productRoutes");
const inventoryRouter = require("./routes/inventoryRoutes");

const session = require("express-session");
// const passport = require("passport");
const mongoose = require("mongoose");
const app = express();
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(session({ secret: "secret", saveUninitialized: false, resave: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));
// cors
const CLIENT_URL = process.env.CLIENT_URL;
const corsCfg = {
  origin: CLIENT_URL, // Allow only your React app's origin
  methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies and authorization headers
}
// Temporary: Allow all origins
app.use(cors());

// helmet
app.use(helmet());
//routes
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/inventory", inventoryRouter);
// db connection
const DB_URI = process.env.MONGOLAB_URI;
mongoose
  .connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .catch((error) => console.log(error));
// run server
const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
module.exports = app;
