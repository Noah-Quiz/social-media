const { version } = require("../package.json");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const getLogger = require("./logger");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express Nodejs Rest API Docs",
      version: version,
    },
    components: {
      securitySchemas: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./dtos/*/*.js","./enums/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDoc(app, port) {
    const logger= getLogger("SWAGGER");

  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Swagger is running at: http://localhost:${port}/api-docs`);
}

module.exports = swaggerDoc;
