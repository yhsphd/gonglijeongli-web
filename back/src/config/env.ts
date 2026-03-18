import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  CORS_ALLOWED_DOMAIN: z.string().optional(),
  SESSION_SECRET: z.string(),
  ADMIN_USERNAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  DATABASE_URL: z.string(),
  // 이미지 업로드 저장 디렉터리 (절대경로 또는 상대경로)
  // 프로덕션: OCI 영구 볼륨 경로, 개발: back/uploads/
  UPLOAD_DIR: z.string().default(""),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
