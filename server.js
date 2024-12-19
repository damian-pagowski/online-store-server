require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app"); 

const DB_URI = process.env.MONGOLAB_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  });

const SERVER_PORT = process.env.PORT || process.env.SERVER_PORT || 3030;
const server = app.listen(SERVER_PORT, () =>
  console.log(`Server is running on port ${SERVER_PORT}`)
);

server.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
  process.exit(1);
});


// Swagger - only in development mode
if (process.env.NODE_ENV === 'development') {
    setupSwaggerDocs(app, SERVER_PORT);
  }

module.exports = server;