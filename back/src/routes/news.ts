import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/auth";
import { requireFeatureEnabled } from "../middleware/featureGuard";
import { extractLocalImageUrls, syncImageReferences } from "../utils/imageTracker";

const router = Router();

type TiptapNode = {
  type?: string;
  attrs?: { src?: string };
  content?: TiptapNode[];
};

function extractFirstImageFromTiptap(doc: unknown): string | null {
  if (!doc || typeof doc !== "object") return null;

  const node = doc as TiptapNode;

  if (node.type === "image" && node.attrs?.src) {
    return node.attrs.src;
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const src = extractFirstImageFromTiptap(child);
      if (src) return src;
    }
  }

  return null;
}

/**
 * GET /api/news?page=1&limit=10
 *
 * 페이지네이션된 뉴스 목록을 반환합니다.
 */
router.get("/", requireFeatureEnabled("showNewsTab"), async (req: Request, res: Response) => {
  // #swagger.tags = ['News']
  // #swagger.summary = '뉴스 목록 조회 (페이지네이션)'
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: '페이지 번호' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: '페이지당 항목 수' }
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        skip,
        take: limit,
        // 완전히 동일한 ms(밀리초) 시간대에 작성된 시드 데이터 정렬을 위해 id(순번)를 보조 정렬 조건으로 추가합니다.
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          thumbnail: true,
          date: true,
          views: true,
          likes: true,
          // content 뺌 (목록엔 필요 없음)
        },
      }),
      prisma.news.count(),
    ]);

    res.json({ items, total });
  } catch (error) {
    console.error("GET /api/news 오류:", error);
    res.status(500).json({ message: "뉴스 목록을 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * GET /api/news/:id
 * 뉴스 상세 조회 (및 조회수 1 증가)
 */
router.get("/:id", requireFeatureEnabled("showNewsTab"), async (req: Request, res: Response) => {
  // #swagger.tags = ['News']
  // #swagger.summary = '뉴스 상세 조회'
  // #swagger.parameters['id'] = { description: '뉴스 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    // 존재하는지 먼저 확인
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 뉴스를 찾을 수 없습니다." });
      return;
    }

    // 조회수 1 증가시키고 결과 반환
    const news = await prisma.news.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    res.json(news);
  } catch (error) {
    console.error("GET /api/news/:id 오류:", error);
    res.status(500).json({ message: "뉴스를 불러오는 중 오류가 발생했습니다." });
  }
});

/**
 * POST /api/news
 * 새 공지사항/뉴스 작성.
 */
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['News']
  // #swagger.summary = '새 뉴스 생성'
  // #swagger.security = [{ "cookieAuth": [] }]
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '뉴스 데이터',
        required: true,
        schema: {
            title: 'Sample News',
            content: 'This is the news content',
            thumbnail: 'https://example.com/image.jpg',
            date: '2023-10-31'
        }
  } */
  try {
    const { title, content, date } = req.body;

    if (!title || !content || !date) {
      res.status(400).json({ message: "title, content, date는 필수입니다." });
      return;
    }

    let parsedContent = content;
    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        console.warn("POST /api/news content JSON 파싱 실패:", parseError);
      }
    }
    const computedThumbnail = extractFirstImageFromTiptap(parsedContent);

    const news = await prisma.news.create({
      data: {
        title,
        content: typeof content === "string" ? content : JSON.stringify(content), // 만약 객체로 오면 문자열 변환
        thumbnail: computedThumbnail,
        date,
      },
    });

    // 이미지 참조 동기화
    const urlsToTrack = [
      ...extractLocalImageUrls(news.thumbnail),
      ...extractLocalImageUrls(news.content),
    ];
    await syncImageReferences("news", news.id, urlsToTrack);

    res.status(201).json(news);
  } catch (error) {
    console.error("POST /api/news 오류:", error);
    res.status(500).json({ message: "뉴스를 생성하는 중 오류가 발생했습니다." });
  }
});

/**
 * PUT /api/news/:id
 * 뉴스 수정.
 */
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['News']
  // #swagger.summary = '뉴스 수정'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '뉴스 ID' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '수정할 뉴스 데이터',
        required: true,
        schema: {
            title: 'Updated News',
            content: 'Updated content',
            thumbnail: 'https://example.com/updated.jpg',
            date: '2023-11-01',
            likes: 10
        }
  } */
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const { title, content, date, likes } = req.body;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 뉴스를 찾을 수 없습니다." });
      return;
    }

    // Update payload
    const updateData: Parameters<typeof prisma.news.update>[0]["data"] = {
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date }),
      ...(likes !== undefined && { likes }), // 좋아요 직접 수정 허용하는 경우
    };

    if (content !== undefined) {
      updateData.content = typeof content === "string" ? content : JSON.stringify(content);
      let parsedContent = content;
      if (typeof content === "string") {
        try {
          parsedContent = JSON.parse(content);
        } catch (parseError) {
          console.warn("PUT /api/news/:id content JSON 파싱 실패:", parseError);
        }
      }
      updateData.thumbnail = extractFirstImageFromTiptap(parsedContent);
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData,
    });

    // 이미지 참조 동기화
    const urlsToTrack = [
      ...extractLocalImageUrls(news.thumbnail),
      ...extractLocalImageUrls(news.content),
    ];
    await syncImageReferences("news", news.id, urlsToTrack);

    res.json(news);
  } catch (error) {
    console.error("PUT /api/news/:id 오류:", error);
    res.status(500).json({ message: "뉴스를 수정하는 중 오류가 발생했습니다." });
  }
});

/**
 * DELETE /api/news/:id
 * 뉴스 삭제.
 */
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  // #swagger.tags = ['News']
  // #swagger.summary = '뉴스 삭제'
  // #swagger.security = [{ "cookieAuth": [] }]
  // #swagger.parameters['id'] = { description: '뉴스 ID' }
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "유효하지 않은 ID입니다." });
      return;
    }

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "해당 뉴스를 찾을 수 없습니다." });
      return;
    }

    await prisma.news.delete({ where: { id } });

    // 연관된 이미지 참조 모두 삭제 (고아 파일로 만들어 가비지 컬렉터가 지울 수 있게 함)
    await prisma.imageReference.deleteMany({
      where: { targetType: "news", targetId: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/news/:id 오류:", error);
    res.status(500).json({ message: "뉴스를 삭제하는 중 오류가 발생했습니다." });
  }
});

export default router;
