import { Router } from "express";
import { prisma } from "../prisma";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/config - 누구나 설정 조회 가능
router.get("/", async (req, res) => {
  try {
    let config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          showAboutTab: true,
          showNewsTab: true,
          showEventsTab: true,
          showWorksTab: true,
          showGalleryTab: true,
          showAboutBox: true,
          showNewsBox: true,
          showEventsBox: true,
          showWorksBox: true,
          showGalleryBox: true,
        },
      });
    }
    res.json(config);
  } catch (error) {
    console.error("사이트 설정 조회 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// PUT /api/config - 관리자만 설정 수정 가능
router.put("/", requireAdmin, async (req, res) => {
  try {
    const {
      showAboutTab,
      showNewsTab,
      showEventsTab,
      showWorksTab,
      showGalleryTab,
      showAboutBox,
      showNewsBox,
      showEventsBox,
      showWorksBox,
      showGalleryBox,
    } = req.body;

    const updatedConfig = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {
        showAboutTab: showAboutTab ?? true,
        showNewsTab: showNewsTab ?? true,
        showEventsTab: showEventsTab ?? true,
        showWorksTab: showWorksTab ?? true,
        showGalleryTab: showGalleryTab ?? true,
        showAboutBox: showAboutBox ?? true,
        showNewsBox: showNewsBox ?? true,
        showEventsBox: showEventsBox ?? true,
        showWorksBox: showWorksBox ?? true,
        showGalleryBox: showGalleryBox ?? true,
      },
      create: {
        id: 1,
        showAboutTab: showAboutTab ?? true,
        showNewsTab: showNewsTab ?? true,
        showEventsTab: showEventsTab ?? true,
        showWorksTab: showWorksTab ?? true,
        showGalleryTab: showGalleryTab ?? true,
        showAboutBox: showAboutBox ?? true,
        showNewsBox: showNewsBox ?? true,
        showEventsBox: showEventsBox ?? true,
        showWorksBox: showWorksBox ?? true,
        showGalleryBox: showGalleryBox ?? true,
      },
    });

    res.json(updatedConfig);
  } catch (error) {
    console.error("사이트 설정 업데이트 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
