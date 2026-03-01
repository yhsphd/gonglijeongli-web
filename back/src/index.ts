import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// 라우트 import
import authRoutes from "./routes/auth";
import eventsRoutes from "./routes/events";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ─── Middleware ───

// CORS 설정: 프론트엔드(Vite dev server)에서의 요청 허용
// credentials: true → 쿠키(세션)를 포함한 cross-origin 요청 허용
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── 세션 설정 ───
// express-session은 서버 메모리에 세션을 저장합니다.
// secret: 세션 쿠키를 서명하는 비밀 키 (반드시 .env에서 관리)
// resave: 세션이 수정되지 않아도 다시 저장할지 (false 권장)
// saveUninitialized: 초기화되지 않은 세션을 저장할지 (false = 로그인 전엔 쿠키 발급 안 함)
// cookie.secure: HTTPS에서만 쿠키 전송 (개발 시 false)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS 필수
      httpOnly: true, // JavaScript에서 쿠키 접근 불가 (XSS 방지)
      maxAge: 1000 * 60 * 60 * 24, // 24시간
      sameSite: "lax", // CSRF 방지
    },
  })
);

// ─── API 라우트 ───
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);

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
