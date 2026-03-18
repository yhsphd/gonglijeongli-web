/**
 * 이미지 업로드 라우트
 *
 * POST /api/upload
 * - 이미지 파일을 받아 UPLOAD_DIR(env) 디렉터리에 저장
 * - 저장된 파일의 접근 URL을 반환
 * - 관리자 인증 필요
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middleware/auth";
import { env } from "../config/env";

const router = Router();

// 업로드 디렉터리 결정:
//   1. UPLOAD_DIR 환경변수가 있으면 그 경로 사용 (프로덕션)
//   2. 없으면 back/uploads/ 기본 경로 사용 (개발)
export const UPLOADS_DIR = env.UPLOAD_DIR
  ? path.resolve(env.UPLOAD_DIR)
  : path.join(__dirname, "../../uploads");

// 디렉터리가 없으면 자동 생성
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // 파일명: 타임스탬프 + 원본 확장자 (예: 1710000000000.jpg)
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

// 허용 파일 형식 필터
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("허용되지 않는 파일 형식입니다. JPG, PNG, WEBP, GIF만 가능합니다."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * POST /api/upload
 * 이미지 파일을 업로드합니다. 관리자 인증 필요.
 *
 * Request: multipart/form-data, field name: "image"
 * Response: { url: "/uploads/1710000000000.jpg" }
 */
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  (req: Request, res: Response): void => {
    // #swagger.tags = ['Upload']
    // #swagger.summary = '이미지 업로드 (관리자)'
    // #swagger.security = [{ "cookieAuth": [] }]

    if (!req.file) {
      res.status(400).json({ message: "업로드된 파일이 없습니다." });
      return;
    }

    // 클라이언트에서 접근 가능한 URL 반환
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  }
);

export default router;
