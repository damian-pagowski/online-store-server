require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const session = require("express-session");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

// Routers
const usersRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");
const productRouter = require("./routes/productRoutes");
const inventoryRouter = require("./routes/inventoryRoutes");

const app = express();

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    saveUninitialized: false,
    resave: false,
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: CLIENT_URL, // Allow only the React app's origin
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    credentials: true, // Allow cookies and authorization headers
  })
);

// Security headers
app.use(helmet());

// Routes
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/inventory", inventoryRouter);

// Database connection
const DB_URI = process.env.MONGOLAB_URI;
mongoose
  .connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start server
const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
app.listen(SERVER_PORT, () =>
  console.log(`Server is running on port ${SERVER_PORT}`)
);

module.exports = app;