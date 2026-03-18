import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import path from "path";

import authRoutes from "./routes/auth";
import eventsRoutes from "./routes/events";
import newsRoutes from "./routes/news";
import worksRoutes from "./routes/works";
import uploadRoutes, { UPLOADS_DIR } from "./routes/upload";
import { env } from "./config/env";

dotenv.config();

const app = express();
const port = env.PORT;

// 프로덕션 환경(Nginx, ALB 등 뒤)에서 secure 쿠키가 작동하도록 설정
// X-Forwarded-Proto 헤더를 신뢰하여 HTTPS 여부를 판단합니다.
app.set("trust proxy", 1);

// ─── Middleware ───

// CORS 설정: 프론트엔드(Vite dev server)에서의 요청 허용
// credentials: true → 쿠키(세션)를 포함한 cross-origin 요청 허용
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. origin이 없는 경우 (동일 출처 요청, curl 등 서버 간 통신) -> 허용
      if (!origin) return callback(null, true);

      // 2. 개발 환경 (localhost) 허용
      if (origin.startsWith("http://localhost:")) return callback(null, true);

      // 3. 허용된 도메인 리스트 확인 (환경변수)
      const allowedOrigins = (env.CORS_ALLOWED_ORIGINS || "").split(",");
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 4. 메인 도메인 및 서브도메인 허용
      const allowedDomain = env.CORS_ALLOWED_DOMAIN;
      if (
        allowedDomain &&
        (origin.endsWith(`.${allowedDomain}`) || origin === `https://${allowedDomain}`)
      ) {
        return callback(null, true);
      }

      // 그 외 차단
      callback(new Error("Not allowed by CORS"));
    },
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
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production", // 프로덕션에서만 HTTPS 필수
      httpOnly: true, // JavaScript에서 쿠키 접근 불가 (XSS 방지)
      maxAge: 1000 * 60 * 60 * 24, // 24시간
      sameSite: "lax", // CSRF 방지
    },
  })
);

// ─── API 라우트 ───
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/works", worksRoutes);
app.use("/api/upload", uploadRoutes);

// ─── 정적 파일 서빙 ───
// 업로드된 이미지 파일을 /uploads URL로 접근 가능하게 합니다.
// UPLOADS_DIR는 UPLOAD_DIR 환경변수를 우선하며, 없으면 back/uploads/ 사용.
app.use("/uploads", express.static(UPLOADS_DIR));

// Swagger Setup
try {
  const swaggerFile = [
    path.join(__dirname, "swagger-output.json"), // production (dist/) & dev (src/ since node swagger.js generates it here)
  ].find((p) => fs.existsSync(p));

  const swaggerDocument = swaggerFile ? JSON.parse(fs.readFileSync(swaggerFile, "utf-8")) : null;
  if (!swaggerDocument)
    throw new Error("swagger-output.json을 찾을 수 없습니다. npm run dev를 재시작하세요.");

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn("Swagger UI를 로드할 수 없습니다:", (error as Error).message);
}

// Basic Route
app.get("/", (req, res) => {
  res.send("Gonglijeongli API Server is running. Visit /api/docs for Swagger documentation.");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api/docs`);
});
