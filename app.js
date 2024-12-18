require("dotenv").config();
const { setupSwaggerDocs } = require("./utils/swagger");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const usersRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");
const productRouter = require("./routes/productRoutes");
const inventoryRouter = require("./routes/inventoryRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const orderRouter = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');
const xssClean = require('xss-clean');

const app = express();

// XSS attack prevention
app.use(xssClean());

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

// CORS 
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

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"], // Block everything by default
      imgSrc: ["'self'"], // Allow images only from this server
    }
  }
}));


// Routes
app.use("/categories", categoryRouter);
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/inventory", inventoryRouter);
app.use("/orders", orderRouter);
// Error Handling
app.use(errorHandler);

// DB Start
const DB_URI = process.env.MONGOLAB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
app.listen(SERVER_PORT, () =>
  console.log(`Server is running on port ${SERVER_PORT}`)
);

// Swagger - only in development mode
if (process.env.NODE_ENV === 'development') {
  setupSwaggerDocs(app, SERVER_PORT);
}

module.exports = app;