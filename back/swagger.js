const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Gonglijeongli API",
    description: "API Documentation for Gonglijeongli Backend",
  },
  servers: [
    {
      url: "/",
      description: "Relative URL for current domain",
    },
    {
      url: "http://localhost:3000",
      description: "Local Dev Server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
      },
    },
  },
};

const outputFile = "./src/swagger-output.json";
const routes = ["./src/index.ts"];

swaggerAutogen(outputFile, routes, doc);
