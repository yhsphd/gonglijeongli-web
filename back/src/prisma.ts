/**
 * Prisma Client 싱글턴
 *
 * 왜 싱글턴?
 * - Prisma Client는 DB 커넥션 풀을 관리합니다.
 * - 여러 파일에서 `new PrismaClient()`를 호출하면 커넥션이 중복 생성됩니다.
 * - 이 파일에서 하나만 만들어 전체 앱에서 공유합니다.
 *
 * Prisma 7.x 드라이버 어댑터:
 * - Prisma 7부터는 DB 드라이버를 직접 지정해야 합니다.
 * - SQLite → @prisma/adapter-better-sqlite3 사용
 * - PostgreSQL → @prisma/adapter-pg 사용 (나중에 전환 시)
 *
 * 사용법:
 *   import { prisma } from "./prisma";
 *   const events = await prisma.event.findMany();
 */

import path from "path";
import "dotenv/config"; // 라우터 등에서 로드되기 전에 환경변수를 읽기 위해 추가
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - 'npm run clean' 시 generated 폴더가 삭제되어 생기는 잠재적 타입 에러 무시
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// SQLite DB URL (환경변수 DATABASE_URL 우선, 없으면 로컬 dev.db)
const dbUrl = process.env.DATABASE_URL || `file:${path.resolve(__dirname, "..", "dev.db")}`;

// 드라이버 어댑터 생성: Prisma와 실제 DB 드라이버를 연결하는 중간 레이어
const adapter = new PrismaBetterSqlite3({ url: dbUrl });

export const prisma = new PrismaClient({
  adapter,
  // 개발 중 SQL 쿼리를 콘솔에 출력하려면 아래 주석 해제
  // log: ["query", "info", "warn", "error"],
});
