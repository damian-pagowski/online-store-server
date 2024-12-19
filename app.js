require("dotenv").config();
const path = require('path');
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xssClean = require('xss-clean');

const usersRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");
const productRouter = require("./routes/productRoutes");
const inventoryRouter = require("./routes/inventoryRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const orderRouter = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// XSS attack prevention
app.use(xssClean());

// Request Parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rate Limiter
app.use(['/users', '/products', '/cart', '/orders'], rateLimit({ windowMs: 60 * 1000, max: 100 }));

// CORS
app.use(cors());

// Static Assets
app.use(express.static(path.resolve(__dirname, 'public')));

// Routes
app.use("/categories", categoryRouter);
app.use("/users", usersRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use("/inventory", inventoryRouter);
app.use("/orders", orderRouter);

// Error Handling
app.use(errorHandler);

module.exports = app;