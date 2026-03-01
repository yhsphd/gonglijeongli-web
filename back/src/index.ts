import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Setup
try {
  const swaggerFile = [
    path.join(__dirname, "swagger.yaml"), // production (dist/)
    path.join(__dirname, "..", "swagger.yaml"), // development (src/)
  ].find((p) => fs.existsSync(p));

  if (!swaggerFile) throw new Error("swagger.yaml을 찾을 수 없습니다.");
  const swaggerDocument = YAML.load(swaggerFile);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn("Swagger UI를 로드할 수 없습니다:", (error as Error).message);
}

// Basic Route
app.get("/", (req, res) => {
  res.send("Gonglijeongli API Server is running. Visit /api-docs for Swagger documentation.");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});
