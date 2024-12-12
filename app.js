require("dotenv").config();
const { setupSwaggerDocs } = require("./utils/swagger");
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
const categoryRouter = require("./routes/categoryRoutes");

const app = express();

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL 
const allowedOrigins = CLIENT_URL ||  ['http://127.0.0.1:3000', 'http://localhost:3000'];
console.log("Allowed Origins: "+ allowedOrigins)

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true 
}));

app.options('*', cors()); // Pre-flight requests for all routes

// debug only
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('Response Headers:', res.getHeaders());
  });
  next();
});

// Security headers
app.use(helmet());

// Routes
app.use("/categories", categoryRouter);
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/inventory", inventoryRouter);

// Database connection
const DB_URI = process.env.MONGOLAB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start server
const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
app.listen(SERVER_PORT, () =>
  console.log(`Server is running on port ${SERVER_PORT}`)
);

// Swagger
setupSwaggerDocs(app, SERVER_PORT);


module.exports = app;