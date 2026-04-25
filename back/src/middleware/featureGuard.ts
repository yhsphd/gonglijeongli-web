import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

/**
 * 특정 기능(News, Events 등)이 비활성화되어 있고
 * 관리자가 아닐 경우 API 접근을 막는 미들웨어(HOC 팩토리 함수).
 *
 * @param configKey 검사할 SiteConfig의 키 (ex. 'showNewsTab', 'showEventsTab' 등)
 */
export const requireFeatureEnabled = (
  configKey: keyof import("../generated/prisma/client").SiteConfig
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. 관리자 세션이 있다면 무조건 통과!
    if (req.session && req.session.isAdmin) {
      return next();
    }

    try {
      // 2. 관리자가 아니면 설정값을 조회하여 활성화되어 있는지 확인
      const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });

      // DB에 없거나 값이 false라면 차단
      if (!config || !config[configKey]) {
        return res.status(403).json({ message: "현재 비활성화된 기능입니다." });
      }

      // 활성화되어 있다면 통과
      next();
    } catch (error) {
      console.error(`권한 확인 오류 (${String(configKey)}):`, error);
      res.status(500).json({ message: "서버 오류로 접근 권한을 확인할 수 없습니다." });
    }
  };
};
