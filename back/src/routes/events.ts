/**
 * 행사(Events) CRUD 라우트
 *
 * GET    /api/events      - 행사 목록 (페이지네이션)
 * POST   /api/events      - 행사 생성 (관리자)
 * PUT    /api/events/:id   - 행사 수정 (관리자)
 * DELETE /api/events/:id   - 행사 삭제 (관리자)
 *
 * Prisma 사용법 핵심 정리:
 * ─────────────────────
 * - prisma.event.findMany()    → SELECT * FROM events
 * - prisma.event.findUnique()  → SELECT * FROM events WHERE id = ?
 * - prisma.event.create()      → INSERT INTO events ...
 * - prisma.event.update()      → UPDATE events SET ... WHERE id = ?
 * - prisma.event.delete()      → DELETE FROM events WHERE id = ?
 * - prisma.event.count()       → SELECT COUNT(*) FROM events
 *
 * Prisma는 schema.prisma의 모델명을 기반으로 타입과 메서드를 자동 생성합니다.
 * `model Event` → `prisma.event` (소문자 camelCase)
 */

import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/auth";
import { requireFeatureEnabled } from "../middleware/featureGuard";
import { extractLocalImageUrls, syncImageReferences } from "../utils/imageTracker";

const router = Router();

/**
 * GET /api/events?page=1&limit=10
 *
 * 페이지네이션된 행사 목록을 반환합니다.
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 10)
 *
 * 응답 형식 (swagger.yaml과 일치):
 * {
 *   items: EventItem[],
 *   total: number       ← 전체 아이템 수 (프론트에서 totalPages 계산용)
 * }
 */
router.get("/", requireFeatureEnabled("showEventsTab"), async (req: Request, res: Response) => {
  // #swagger.tags = ['Events']
  // #swagger.summary = '행사 목록 조회 (페이지네이션)'
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: '페이지 번호' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: '페이지당 항목 수' }
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    // skip: 건너뛸 행 수 (offset)
    // take: 가져올 행 수 (limit)
    const skip = (page - 1) * limit;

    // Promise.all로 두 쿼리를 동시에 실행 (성능 최적화)
    const [items, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: [
          // createdAt 역순으로 정렬 (최신 먼저)
          { createdAt: "desc" },
        ],
        // select: 필요한 필드만 선택 (createdAt/updatedAt 제외)
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          thumb: true,
          link: true,
          status: true,
        },
      }),
      prisma.event.count(),
    ]);

    res.json({ items, total });
  } catch (error) {
    console.error("GET /api/events 오류:", error);
    res.status(500).json({ message: "행사 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * POST /api/events
 * 새 행사를 생성합니다. 관리자 인증 필요.
 *
 * Request Body:
 * {
 *   title: string,       (필수)
 *   date: string,        (필수)
 *   location: string,    (필수)
 *   thumb?: string,
 *   link?: string,
 *   status?: string      (기본값: "upcoming")
 * }
 */
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Events']
  // #swagger.summary = '새 행사 생성'
  // #swagger.security = [{ "cookieAuth": [] }]
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '행사 데이터',
        required: true,
        schema: {
            title: 'Sample Event',
            date: '2023-10-31',
            location: 'Seoul',
            thumb: 'https://example.com/image.jpg',
            link: 'https://example.com',
            status: 'upcoming'
        }
  } */
  try {
    const { title, date, location, thumb, link, status } = req.body;

    // 필수 필드 검증
    if (!title || !date || !location) {
      res.status(400).json({ message: "title, date, location은 필수입니다." });
      return;
    }

    // status 유효성 검증
    const validStatuses = ["upcoming", "ongoing", "ended"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ message: `status는 ${validStatuses.join(", ")} 중 하나여야 합니다.` });
      return;
    }

    // prisma.event.create()는 INSERT를 실행하고 생성된 레코드를 반환
    const event = await prisma.event.create({
      data: {
        title,
        date,
        location,
        thumb: thumb || null,
        link: link || null,
        status: status || "upcoming",
      },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        thumb: true,
        link: true,
        status: true,
      },
    });

    // 이미지 참조 동기화
    const urlsToTrack = extractLocalImageUrls(event.thumb);
    await syncImageReferences("events", event.id, urlsToTrack);

    res.status(201).json(event);
  } catch (error) {
    console.error("POST /api/events 오류:", error);
    res.status(500).json({ message: "행사를 생성하는 중 오류가 발생했습니다." });
  }
});

/**
 * PUT /api/events/:id
 * 기존 행사를 수정합니다. 관리자 인증 필요.
 */
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Events']
  // #swagger.summary = '행사 수정'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '행사 ID' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '수정할 행사 데이터',
        required: true,
        schema: {
            title: 'Updated Event',
            date: '2023-11-01',
            location: 'Busan',
            thumb: 'https://example.com/updated.jpg',
            link: 'https://example.com/updated',
            status: 'ongoing'
        }
  } */
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const { title, date, location, thumb, link, status } = req.body;

    // 해당 ID의 행사가 존재하는지 확인
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 행사를 찾을 수 없습니다." });
      return;
    }

    // status 유효성 검증
    const validStatuses = ["upcoming", "ongoing", "ended"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ message: `status는 ${validStatuses.join(", ")} 중 하나여야 합니다.` });
      return;
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        // 전달된 값만 업데이트 (undefined면 기존 값 유지)
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date }),
        ...(location !== undefined && { location }),
        ...(thumb !== undefined && { thumb: thumb || null }),
        ...(link !== undefined && { link: link || null }),
        ...(status !== undefined && { status }),
      },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        thumb: true,
        link: true,
        status: true,
      },
    });

    // 이미지 참조 동기화
    const urlsToTrack = extractLocalImageUrls(event.thumb);
    await syncImageReferences("events", event.id, urlsToTrack);

    res.json(event);
  } catch (error) {
    console.error("PUT /api/events/:id 오류:", error);
    res.status(500).json({ message: "행사를 수정하는 중 오류가 발생했습니다." });
  }
});

/**
 * DELETE /api/events/:id
 * 행사를 삭제합니다. 관리자 인증 필요.
 * 성공 시 204 No Content 반환.
 */
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['Events']
  // #swagger.summary = '행사 삭제'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '행사 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 행사를 찾을 수 없습니다." });
      return;
    }

    await prisma.event.delete({ where: { id } });

    // 연관된 이미지 참조 모두 삭제
    await prisma.imageReference.deleteMany({
      where: { targetType: "events", targetId: id },
    });

    res.status(204).send(); // 204는 응답 본문 없음
  } catch (error) {
    console.error("DELETE /api/events/:id 오류:", error);
    res.status(500).json({ message: "행사를 삭제하는 중 오류가 발생했습니다." });
  }
});

export default router;
