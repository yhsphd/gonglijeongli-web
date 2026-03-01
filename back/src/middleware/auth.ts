/**
 * 세션 인증 미들웨어
 *
 * 세션(Session) 인증 방식 설명:
 * ──────────────────────────
 * 1. 사용자가 /api/auth/login에 username+password를 보냄
 * 2. 서버가 검증 후 세션 ID를 쿠키로 발급 (connect.sid)
 * 3. 이후 요청마다 브라우저가 자동으로 쿠키를 보냄
 * 4. 서버가 세션 스토어에서 해당 ID로 사용자 정보를 조회
 *
 * JWT와의 차이:
 * - JWT: 토큰에 정보가 담겨있어 서버가 상태를 저장하지 않음(stateless)
 * - Session: 서버가 세션 정보를 메모리/DB에 저장(stateful)
 * - Session이 더 간단하고, 로그아웃 시 즉시 무효화 가능
 *
 * 현재 구현:
 * - 메모리 세션 스토어 사용 (서버 재시작 시 세션 초기화)
 * - 프로덕션에서는 prisma-session-store 등으로 DB 기반 세션 스토어 사용 권장
 */

import { Request, Response, NextFunction } from "express";

// express-session이 req.session에 추가하는 타입 확장
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    username?: string;
  }
}

/**
 * 관리자 인증이 필요한 라우트에 사용하는 미들웨어.
 * 세션에 isAdmin=true가 없으면 401 응답.
 *
 * 사용 예:
 *   router.post("/events", requireAdmin, createEventHandler);
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
    next(); // 인증 통과 → 다음 핸들러로 진행
  } else {
    res.status(401).json({ message: "관리자 인증이 필요합니다." });
  }
};
