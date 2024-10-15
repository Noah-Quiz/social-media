const { version } = require("../package.json");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const getLogger = require("./logger");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API Docs",
      version: version,
      description:
        "This is a simple CRUD API application made with Express NodeJS and documented with Swagger",
      contact: {
        name: "Github",
        url: "https://github.com/ellie2222222/social-media",
      },
      // license: {
      //   name: "MIT",
      //   url: "",
      // },
      // termsOfService: "social-media",
    },
    servers: [
      {
        url: `http://localhost:${process.env.DEVELOPMENT_PORT || 4000}`,
        description: "Development server",
      },
      {
        url: "https://social-media-ofm3.onrender.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Operations about Authorization",
        // externalDocs: {
        //   description: "Find out more about Auth",
        //   url: "https://github.com/ellie2222222/social-media/wiki/Auth",
        // },
      },
      {
        name: "Users",
        description: "Operations about users",
      },
      {
        name: "Categories",
        description: "Operations about categories",
      },
      {
        name: "Comments",
        description: "Operations about comments",
      },
      {
        name: "Messages",
        description: "Operations about messages",
      },
      {
        name: "Receipts",
        description: "Operations about receipts",
      },
      {
        name: "MyPlaylists",
        description: "Operations about my playlists",
      },
    ],
    components: {
      securitySchemes: {
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
  apis: ["./routes/*.js", "./dtos/*/*.js", "./enums/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDoc(app, port) {
  const logger = getLogger("SWAGGER");

  // Swagger page
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        docExpansion: "list",
        filter: true,
        persistAuthorization: true,
      },
      explorer: true,
    })
  );

  // Docs in JSON format
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Swagger is running at: http://localhost:${port}/api-docs`);
}

module.exports = swaggerDoc;
