import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/auth";
import { extractLocalImageUrls, syncImageReferences } from "../utils/imageTracker";

const router = Router();

/**
 * GET /api/banners
 * 메인 배너 목록을 반환합니다. 파라미터가 없거나 activeOnly가 없으면 모든 배너를 반환합니다.
 */
router.get("/", async (req: Request, res: Response) => {
  // #swagger.tags = ['Banners']
  // #swagger.summary = '배너 목록 조회'
  // #swagger.parameters['activeOnly'] = { in: 'query', type: 'boolean', description: '활성화된 배너만 조회할지 여부' }
  try {
    const activeOnly = req.query.activeOnly === "true";

    const banners = await prisma.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { displayOrder: "asc" },
    });

    res.json(banners);
  } catch (error) {
    console.error("GET /api/banners 오류:", error);
    res.status(500).json({ message: "배너 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * POST /api/banners
 * 새 배너 생성
 */
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Banners']
  // #swagger.summary = '새 배너 생성'
  // #swagger.security = [{ "cookieAuth": [] }]
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '배너 데이터',
        required: true,
        schema: {
            imageUrl: '/uploads/abc.jpg',
            linkUrl: 'https://example.com',
            displayOrder: 1,
            isActive: true
        }
  } */
  try {
    const { imageUrl, linkUrl, displayOrder, isActive } = req.body;

    if (!imageUrl) {
      res.status(400).json({ message: "imageUrl은 필수입니다." });
      return;
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        linkUrl,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // 이미지 경로 동기화 (고아 이미지 방지용)
    const urlsToTrack = extractLocalImageUrls(banner.imageUrl);
    await syncImageReferences("banners", banner.id, urlsToTrack);

    res.status(201).json(banner);
  } catch (error) {
    console.error("POST /api/banners 오류:", error);
    res.status(500).json({ message: "배너를 생성하는 중 오류가 발생했습니다." });
  }
});

/**
 * PUT /api/banners/:id
 * 배너 정보 수정
 */
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Banners']
  // #swagger.summary = '배너 수정'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '배너 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const { imageUrl, linkUrl, displayOrder, isActive } = req.body;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 배너를 찾을 수 없습니다." });
      return;
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (imageUrl !== undefined) {
      const urlsToTrack = extractLocalImageUrls(banner.imageUrl);
      await syncImageReferences("banners", banner.id, urlsToTrack);
    }

    res.json(banner);
  } catch (error) {
    console.error("PUT /api/banners/:id 오류:", error);
    res.status(500).json({ message: "배너를 수정하는 중 오류가 발생했습니다." });
  }
});

/**
 * DELETE /api/banners/:id
 * 배너 삭제
 */
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Banners']
  // #swagger.summary = '배너 삭제'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '배너 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 배너를 찾을 수 없습니다." });
      return;
    }

    await prisma.banner.delete({ where: { id } });

    // 연관된 이미지 참조 모두 삭제
    await prisma.imageReference.deleteMany({
      where: { targetType: "banners", targetId: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/banners/:id 오류:", error);
    res.status(500).json({ message: "배너를 삭제하는 중 오류가 발생했습니다." });
  }
});

export default router;
