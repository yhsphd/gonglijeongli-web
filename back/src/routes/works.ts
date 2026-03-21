/**
 * 작품(Works) CRUD 라우트
 *
 * GET    /api/works      - 작품 목록 (페이지네이션)
 * POST   /api/works      - 작품 생성 (관리자)
 * PUT    /api/works/:id   - 작품 수정 (관리자)
 * DELETE /api/works/:id   - 작품 삭제 (관리자)
 */

import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/auth";
import { extractLocalImageUrls, syncImageReferences } from "../utils/imageTracker";

const router = Router();

/**
 * GET /api/works?page=1&limit=9
 */
router.get("/", async (req: Request, res: Response) => {
  // #swagger.tags = ['Works']
  // #swagger.summary = '작품 목록 조회 (페이지네이션)'
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: '페이지 번호' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: '페이지당 항목 수' }
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 9));

    const skip = (page - 1) * limit;

    const [itemsRaw, total] = await Promise.all([
      prisma.work.findMany({
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          thumb: true,
          link: true,
          tags: true,
        },
      }),
      prisma.work.count(),
    ]);

    // tags 필드를 JSON.parse하여 배열로 변환
    const items = itemsRaw.map((item) => ({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
    }));

    res.json({ items, total });
  } catch (error) {
    console.error("GET /api/works 오류:", error);
    res.status(500).json({ message: "작품 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * POST /api/works
 */
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Works']
  // #swagger.summary = '새 작품 생성'
  // #swagger.security = [{ "cookieAuth": [] }]
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '작품 데이터',
        required: true,
        schema: {
            title: 'Sample Work',
            description: 'Sample Description',
            date: '2026.02',
            thumb: 'https://example.com/image.jpg',
            link: 'https://example.com',
            tags: ['동방', '회지']
        }
  } */
  try {
    const { title, description, date, thumb, link, tags } = req.body;

    if (!title || !date) {
      res.status(400).json({ message: "title과 date는 필수입니다." });
      return;
    }

    // tags는 배열로 받아서 JSON 문자열로 변환하여 DB에 저장
    const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);

    const workRaw = await prisma.work.create({
      data: {
        title,
        description: description || null,
        date,
        thumb: thumb || null,
        link: link || null,
        tags: tagsString,
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        thumb: true,
        link: true,
        tags: true,
      },
    });

    // 이미지 참조 동기화
    const urlsToTrack = extractLocalImageUrls(workRaw.thumb);
    await syncImageReferences("works", workRaw.id, urlsToTrack);

    const work = {
      ...workRaw,
      tags: workRaw.tags ? JSON.parse(workRaw.tags) : [],
    };

    res.status(201).json(work);
  } catch (error) {
    console.error("POST /api/works 오류:", error);
    res.status(500).json({ message: "작품을 생성하는 중 오류가 발생했습니다." });
  }
});

/**
 * PUT /api/works/:id
 */
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Works']
  // #swagger.summary = '작품 수정'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '작품 ID' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '수정할 작품 데이터',
        required: true,
        schema: {
            title: 'Updated Work',
            description: 'Updated Description',
            date: '2026.03',
            thumb: 'https://example.com/updated.jpg',
            link: 'https://example.com/updated',
            tags: ['동방', '아크릴']
        }
  } */
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const { title, description, date, thumb, link, tags } = req.body;

    const existing = await prisma.work.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 작품을 찾을 수 없습니다." });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (date !== undefined) updateData.date = date;
    if (thumb !== undefined) updateData.thumb = thumb || null;
    if (link !== undefined) updateData.link = link || null;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);
    }

    const workRaw = await prisma.work.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        thumb: true,
        link: true,
        tags: true,
      },
    });

    // 이미지 참조 동기화
    const urlsToTrack = extractLocalImageUrls(workRaw.thumb);
    await syncImageReferences("works", workRaw.id, urlsToTrack);

    const work = {
      ...workRaw,
      tags: workRaw.tags ? JSON.parse(workRaw.tags) : [],
    };

    res.json(work);
  } catch (error) {
    console.error("PUT /api/works/:id 오류:", error);
    res.status(500).json({ message: "작품을 수정하는 중 오류가 발생했습니다." });
  }
});

/**
 * DELETE /api/works/:id
 */
router.delete("/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  // #swagger.tags = ['Works']
  // #swagger.summary = '작품 삭제'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '작품 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const existing = await prisma.work.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 작품을 찾을 수 없습니다." });
      return;
    }

    await prisma.work.delete({ where: { id } });

    // 연관된 이미지 참조 모두 삭제
    await prisma.imageReference.deleteMany({
      where: { targetType: "works", targetId: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/works/:id 오류:", error);
    res.status(500).json({ message: "작품을 삭제하는 중 오류가 발생했습니다." });
  }
});

export default router;
