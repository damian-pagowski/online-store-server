const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "API documentation for the Ecommerce application",
    },
    servers: [
      {
        url: "http://localhost:3030", // Update with your server URL
        description: "Development Server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Location of your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const setupSwaggerDocs = (app, port) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
};

module.exports = { setupSwaggerDocs };