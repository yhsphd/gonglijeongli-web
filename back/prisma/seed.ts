/**
 * Prisma Seed 스크립트
 *
 * 시드(Seed)란?
 * ────────────
 * DB에 초기 데이터를 넣는 스크립트입니다.
 * 개발 시 빈 DB로 시작하면 불편하므로, 테스트용 데이터를 미리 넣어둡니다.
 *
 * 실행 방법:
 *   npx prisma db seed
 *
 * 이 스크립트는 prisma.config.ts의 seed 설정과 연동됩니다.
 * upsert를 사용하여 같은 데이터가 중복 삽입되지 않습니다.
 */

import { prisma } from "../src/prisma";

// EventsView.vue에 있던 defaultEvents를 DB 시드 데이터로 이관
const defaultEvents = [
  {
    title: "미래세기로의 초대장",
    date: "2026.03.15",
    location: "킨텍스 제1전시장",
    thumb: "/assets/events/illustar10.png",
    status: "upcoming",
  },
  {
    title: "코믹마켓 C106",
    date: "2026.08.13 ~ 2026.08.14",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "upcoming",
  },
  {
    title: "코믹월드 서울 2026",
    date: "2026.02.22 ~ 2026.02.23",
    location: "aT센터",
    thumb: "/assets/events/illustar10.png",
    status: "ongoing",
  },
  {
    title: "동방 온리전 '환상경계'",
    date: "2026.01.19",
    location: "서울무역전시컨벤션센터(SETEC)",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
  {
    title: "코믹마켓 C105",
    date: "2025.12.29 ~ 2025.12.30",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
  {
    title: "일러스타 10",
    date: "2025.11.23",
    location: "코엑스 D홀",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
  {
    title: "코믹월드 서울 2025 가을",
    date: "2025.10.18 ~ 2025.10.19",
    location: "aT센터",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
  {
    title: "동방 온리전 '추억의 향연'",
    date: "2025.09.14",
    location: "서울무역전시컨벤션센터(SETEC)",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
  {
    title: "코믹마켓 C104",
    date: "2025.08.11 ~ 2025.08.12",
    location: "도쿄 빅사이트",
    thumb: "/assets/events/illustar10.png",
    status: "ended",
  },
];

async function main() {
  console.log("🌱 시드 데이터 삽입 시작...");

  // 테이블이 비어있을 때만 삽입 (중복 방지)
  const count = await prisma.event.count();
  if (count === 0) {
    // createMany: 여러 레코드를 한 번에 INSERT (성능 좋음)
    await prisma.event.createMany({ data: defaultEvents });
    console.log(`✅ ${defaultEvents.length}개의 행사 데이터가 삽입되었습니다.`);
  } else {
    console.log(`ℹ️  이미 ${count}개의 행사 데이터가 있습니다. 시드를 건너뜁니다.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ 시드 오류:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
