/**
 * 인증(Auth) 라우트
 *
 * POST /api/auth/login  - 로그인
 * POST /api/auth/logout - 로그아웃
 * GET  /api/auth/me     - 현재 세션 정보 확인
 *
 * 현재는 .env의 ADMIN_USERNAME / ADMIN_PASSWORD로 단일 관리자 인증.
 * 실제 운영 시에는 DB에 해싱된 비밀번호를 저장하는 것을 권장합니다.
 */

import { Router, Request, Response } from "express";
import { env } from "../config/env";

const router = Router();

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = '관리자 로그인'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: '관리자 계정 정보',
        required: true,
        schema: {
            username: 'admin',
            password: 'password'
        }
  } */
  const { username, password } = req.body;

  // .env에서 관리자 계정 정보 읽기
  const adminUsername = env.ADMIN_USERNAME;
  const adminPassword = env.ADMIN_PASSWORD;

  if (username === adminUsername && password === adminPassword) {
    // 세션에 관리자 정보 저장
    req.session.isAdmin = true;
    req.session.username = username;
    res.json({ message: "로그인 성공" });
  } else {
    res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = '관리자 로그아웃'
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
    } else {
      res.clearCookie("connect.sid"); // 세션 쿠키 삭제
      res.json({ message: "로그아웃 되었습니다." });
    }
  });
});

// GET /api/auth/me
router.get("/me", (req: Request, res: Response) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = '현재 로그인 상태 확인'
  if (req.session && req.session.isAdmin) {
    res.json({
      isAdmin: true,
      username: req.session.username,
    });
  } else {
    res.json({ isAdmin: false });
  }
});

export default router;
