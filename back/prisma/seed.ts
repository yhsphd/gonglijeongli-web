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

// NewsView.vue에 있던 defaultPosts를 DB 시드 데이터로 이관
const defaultNews = [
  {
    title: "[행사 공지] 미래세기로의 초대장 부스 안내",
    date: "2026.02.10",
    thumbnail: "/assets/news/hijiri.png",
    views: 128,
    likes: 24,
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "2026.01.26에 개최되는 미래세기로의 초대장에서 부스로 찾아뵙게 되었습니다!",
            },
          ],
        },
      ],
    }),
  },
  {
    title: "[신작 안내] 동방 팬북 '경계의 저편' 발매",
    date: "2026.02.05",
    thumbnail: "/assets/news/hijiri.png",
    views: 256,
    likes: 45,
    content: JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "가벼운 팬북입니다." }] }],
    }),
  },
  {
    title: "[통판 안내] 겨울 신작 통신판매 시작",
    date: "2026.01.28",
    thumbnail: "/assets/news/hijiri.png",
    views: 189,
    likes: 32,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[행사 공지] 코믹월드 서울 참가 안내",
    date: "2026.01.15",
    thumbnail: "/assets/news/hijiri.png",
    views: 312,
    likes: 58,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[공지] 2026년 활동 계획 안내",
    date: "2026.01.01",
    thumbnail: "/assets/news/hijiri.png",
    views: 421,
    likes: 73,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[행사 후기] 코믹마켓 C105 참가 후기",
    date: "2025.12.31",
    thumbnail: "/assets/news/hijiri.png",
    views: 534,
    likes: 89,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[신작 안내] 동방 일러스트집 예약 안내",
    date: "2025.12.20",
    thumbnail: "/assets/news/hijiri.png",
    views: 287,
    likes: 41,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[통판 안내] 여름 신작 통신판매 종료 안내",
    date: "2025.12.10",
    thumbnail: "/assets/news/hijiri.png",
    views: 156,
    likes: 19,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[행사 공지] 코믹마켓 C105 참가 안내",
    date: "2025.11.25",
    thumbnail: "/assets/news/hijiri.png",
    views: 478,
    likes: 67,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[공지] 서클 홈페이지 오픈",
    date: "2025.11.01",
    thumbnail: "/assets/news/hijiri.png",
    views: 623,
    likes: 102,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[행사 후기] 가을 온리전 참가 후기",
    date: "2025.10.20",
    thumbnail: "/assets/news/hijiri.png",
    views: 345,
    likes: 52,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  },
  {
    title: "[신작 안내] 가을 신작 안내",
    date: "2025.10.01",
    thumbnail: "/assets/news/hijiri.png",
    views: 267,
    likes: 38,
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
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

  // 뉴스/공지사항 테이블 시드
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({ data: defaultNews });
    console.log(`✅ ${defaultNews.length}개의 뉴스 데이터가 삽입되었습니다.`);
  } else {
    console.log(`ℹ️  이미 ${newsCount}개의 뉴스 데이터가 있습니다. 시드를 건너뜁니다.`);
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
