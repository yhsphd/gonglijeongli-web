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
import crypto from "crypto";
import { requireAdmin } from "../middleware/auth";
import { env } from "../config/env";
import { prisma } from "../prisma";

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

// 메모리 스토리지 설정 (파일 해시 계산을 위해 버퍼 변환)
const storage = multer.memoryStorage();

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
  async (req: Request, res: Response): Promise<void> => {
    // #swagger.tags = ['Upload']
    // #swagger.summary = '이미지 업로드 (관리자)'
    // #swagger.security = [{ "cookieAuth": [] }]

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ message: "업로드된 파일이 없습니다." });
      return;
    }

    try {
      // 1. 파일 해시(SHA-256) 계산
      const hashSum = crypto.createHash("sha256");
      hashSum.update(req.file.buffer);
      const fileHash = hashSum.digest("hex");

      // 2. DB 중복 검사
      const existingImage = await prisma.image.findUnique({
        where: { hash: fileHash },
      });

      if (existingImage) {
        // 이미 존재하는 파일이면 저장 생략 후 기존 URL 반환
        res.status(200).json({ url: existingImage.url });
        return;
      }

      // 3. 존재하지 않으면 새로 디스크에 저장
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${fileHash}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, req.file.buffer);
      const url = `/uploads/${filename}`;

      // 4. DB에 메타데이터 기록
      await prisma.image.create({
        data: {
          hash: fileHash,
          url,
        },
      });

      res.status(201).json({ url });
    } catch (error) {
      console.error("이미지 업로드/해시 실패:", error);
      res.status(500).json({ message: "이미지 처리 중 서버 오류가 발생했습니다." });
    }
  }
);

/**
 * DELETE /api/upload/cleanup
 * 고아 이미지(어떤 엔티티에서도 참조하지 않는 이미지)를 디스크와 DB에서 1차적으로 탐색 후 영구 삭제합니다.
 * (관리자 전용)
 */
router.delete("/cleanup", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  // #swagger.tags = ['Upload']
  // #swagger.summary = '사용하지 않는 미참조 이미지 일괄 삭제 (가비지 컬렉션)'
  // #swagger.security = [{ "cookieAuth": [] }]
  try {
    // 1. 참조가 0개이면서 업로드된 지 24시간이 지난 이미지 검색
    // (임시 업로드 후 글 작성/수정 중단된 이미지들)
    const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orphanedImages = await prisma.image.findMany({
      where: {
        references: { none: {} },
        createdAt: { lt: ONE_DAY_AGO },
      },
    });

    if (orphanedImages.length === 0) {
      res.status(200).json({ message: "삭제할 고아 이미지가 없습니다.", deletedCount: 0 });
      return;
    }

    let deletedCount = 0;
    const failedUrls: string[] = [];

    // 2. 디스크에서 물리적 파일 삭제
    for (const img of orphanedImages) {
      try {
        const filename = path.basename(img.url);
        const filePath = path.join(UPLOADS_DIR, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        deletedCount++;
      } catch (err) {
        console.error(`파일 물리 경로 삭제 실패: ${img.url}`, err);
        failedUrls.push(img.url);
      }
    }

    // 3. DB 레코드 정리
    await prisma.image.deleteMany({
      where: {
        id: { in: orphanedImages.map((img) => img.id) },
      },
    });

    res.status(200).json({
      message: `${deletedCount}개의 고아 이미지가 삭제되었습니다.`,
      deletedCount,
      failedUrls: failedUrls.length > 0 ? failedUrls : undefined,
    });
  } catch (error) {
    console.error("DELETE /api/upload/cleanup 오류:", error);
    res.status(500).json({ message: "이미지 정리 중 서버 오류가 발생했습니다." });
  }
});

export default router;
