# Copilot Instructions - gonglijeongli-web

## Project Overview
멀티 워크스페이스 Vue 3 + Express 웹사이트 프로젝트 (front/back 분리).

## Tech Stack

### Frontend (`front/`)
- **Framework**: Vue 3 + TypeScript + Vite 7
- **Routing**: Vue Router 5 (nested routes with DefaultLayout)
- **State**: Pinia
- **UI**: Element Plus (auto-import), vue3-carousel, Tiptap (rich text editor)
- **Linting**: ESLint + oxlint, Prettier

### Backend (`back/`)
- **Framework**: Express 5 + TypeScript
- **ORM**: Prisma 7 (Client + Migrate)
- **Database**: SQLite (via @prisma/adapter-better-sqlite3) — 프로덕션 전환 가능
- **Auth**: express-session (세션 쿠키 기반, 메모리 스토어)
- **API Docs**: Swagger UI (swagger-ui-express + yamljs)
- **Linting**: ESLint + oxlint, Prettier

## Project Structure
```
front/
├── src/
│   ├── layouts/          # DefaultLayout wraps all routes
│   ├── views/            # Page components
│   │   ├── HomeView.vue, AboutView.vue, GalleryView.vue, EventsView.vue, WorksView.vue
│   │   └── news/         # News 관련 뷰 (하위 폴더로 정리)
│   │       ├── IndexView.vue   # 뉴스 목록
│   │       ├── DetailView.vue  # 뉴스 상세
│   │       └── WriteView.vue   # 뉴스 작성/수정
│   ├── api/              # 백엔드 API 호출 서비스
│   │   ├── client.ts         # fetch 래퍼 (baseURL, credentials, 에러 처리)
│   │   ├── auth.ts           # 로그인/로그아웃/세션 확인
│   │   └── events.ts         # 행사 CRUD + 타입 정의
│   ├── stores/           # Pinia 스토어
│   │   └── auth.ts           # 인증 상태 (isAdmin, login, logout, checkAuth)
│   ├── components/
│   │   ├── common/       # 공통 재사용 컴포넌트
│   │   │   ├── AppHeader.vue, AppFooter.vue (관리자 로그인 모달 포함)
│   │   │   ├── PageHeader.vue      # 페이지 제목 + 설명
│   │   │   ├── AppPagination.vue   # 페이지네이션 (슬롯 지원)
│   │   │   ├── AdminModal.vue      # 관리자 모달 래퍼
│   │   │   ├── ContentCard.vue     # 썸네일 + 콘텐츠 카드 (행사/작품)
│   │   │   ├── CardActions.vue     # 카드 편집/삭제 버튼
│   │   │   ├── FormInput.vue       # 라벨 포함 입력 필드
│   │   │   ├── TiptapEditor.vue    # 리치 텍스트 에디터
│   │   │   └── TiptapRenderer.vue  # 리치 텍스트 렌더러
│   │   └── home/         # Home-specific: HeroCarousel, GalleryCarousel, ListBox
│   ├── assets/
│   │   └── styles/       # root.css (CSS variables), main.css
│   └── router/           # Nested routes under DefaultLayout
└── public/assets/        # Static images (hero/, gallery/, events/, news/, works/)

back/
├── prisma/
│   ├── schema.prisma         # DB 모델 정의 (Event 등)
│   ├── seed.ts               # 초기 데이터 삽입 스크립트
│   └── migrations/           # 자동 생성된 마이그레이션
├── prisma.config.ts          # Prisma 7.x 설정 (DB URL, 시드)
├── swagger.yaml              # OpenAPI 3.0 API 명세
├── .env                      # 환경변수 (gitignore됨)
├── src/
│   ├── index.ts              # Express 앱 (CORS, 세션, 라우트 등록)
│   ├── prisma.ts             # Prisma Client 싱글턴 (어댑터 포함)
│   ├── middleware/
│   │   └── auth.ts           # requireAdmin 미들웨어
│   ├── routes/
│   │   ├── auth.ts           # POST /login, /logout, GET /me
│   │   └── events.ts         # GET/POST/PUT/DELETE /api/events
│   └── generated/prisma/     # Prisma 자동 생성 (gitignore됨)
└── dev.db                    # SQLite DB 파일 (gitignore됨)
```

### 폴더 구조 규칙
- **하위 뷰가 있는 경우**: 해당 도메인 이름의 하위 폴더에 정리 (예: `views/news/`)
- **하위 뷰 명명**: `IndexView.vue` (목록), `DetailView.vue` (상세), `WriteView.vue` (작성)
- **API 서비스 파일**: `api/` 폴더에 도메인별 파일로 분리 (예: `api/events.ts`)
- **백엔드 라우트**: `routes/` 폴더에 도메인별 파일, Router를 export default

## Backend Architecture

### Prisma 7.x
- **스키마**: `prisma/schema.prisma`에서 모델 정의 → `npx prisma migrate dev --name <설명>`으로 마이그레이션
- **Client 생성**: `npx prisma generate` → `src/generated/prisma/`에 타입-세이프 클라이언트 생성
- **어댑터 패턴**: Prisma 7에서는 드라이버 어댑터 필수. `PrismaBetterSqlite3` 사용
- **싱글턴**: `src/prisma.ts`에서 하나의 PrismaClient 인스턴스를 export
- **시드**: `npx prisma db seed` → `prisma/seed.ts` 실행
- **설정**: `prisma.config.ts`에서 DB URL, 시드 명령 등 설정 (schema.prisma의 `url` 대체)

### 인증 (Session)
- express-session으로 세션 쿠키 발급 (`connect.sid`)
- `requireAdmin` 미들웨어로 관리자 전용 라우트 보호
- `.env`의 `ADMIN_USERNAME` / `ADMIN_PASSWORD`로 단일 관리자 인증
- 프론트엔드 AppFooter에 로그인/로그아웃 UI 구현

### API 패턴 (라우트 작성 시 참고)
```typescript
// routes/events.ts 패턴:
router.get("/", async (req, res) => { ... });           // 목록 (페이지네이션)
router.post("/", requireAdmin, async (req, res) => { ... }); // 생성
router.put("/:id", requireAdmin, async (req, res) => { ... }); // 수정
router.delete("/:id", requireAdmin, async (req, res) => { ... }); // 삭제
```
- Prisma `select`로 필요한 필드만 반환 (createdAt/updatedAt 제외)
- 페이지네이션: `skip` / `take` + `count()`로 서버 사이드 처리
- 응답 형식: `{ items: T[], total: number }`

### Swagger
- `swagger.yaml`에 OpenAPI 3.0 명세 정의
- `/api-docs`에서 Swagger UI 제공
- 새 라우트 추가 시 swagger.yaml도 함께 업데이트

## Frontend-Backend Integration

### API 클라이언트 (`api/client.ts`)
- `api<T>(endpoint, options)` 함수로 모든 API 호출
- `credentials: "include"`로 세션 쿠키 자동 포함
- 개발 시 Vite 프록시가 `/api/*` → `http://localhost:3000/api/*`로 전달

### 인증 스토어 (`stores/auth.ts`)
- `useAuthStore()`로 전역 인증 상태 접근
- `authStore.isAdmin`으로 관리자 UI 조건부 렌더링
- App.vue의 `onMounted`에서 `checkAuth()` 호출하여 세션 복원

## CSS Variable System
모든 스타일링은 `src/assets/styles/root.css`에 정의된 CSS 변수 사용:
- **Spacing**: `--spacing-xs` ~ `--spacing-2-5xl`
- **Colors**: `--color-text-*`, `--color-bg-*`, `--color-border`
- **Status Colors**: `--color-info`, `--color-success`, `--color-warning`, `--color-like`, `--color-danger`
- **Source Badge Colors**: `--color-twitter`, `--color-pixiv`, `--color-etc`, `--color-default`
- **Overlay Colors**: `--color-overlay-light`, `--color-overlay-dark`
- **Components**: `--hero-height`, `--hero-margin`, `--entry-height`, etc.
- **Effects**: `--blur-sm`, `--blur-md`, `--shadow-sm`, `--shadow-md`

### Z-Index 계층 시스템
일관된 z-index 사용을 위한 CSS 변수:
| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--z-background` | -10 | 배경 레이어 |
| `--z-default` | 1 | 기본 요소 |
| `--z-dropdown` | 100 | 드롭다운 메뉴 |
| `--z-sticky` | 200 | 고정 요소 |
| `--z-header` | 1000 | 헤더/네비게이션 |
| `--z-overlay` | 2000 | 오버레이 배경 |
| `--z-modal` | 3000 | 모달 창 |
| `--z-lightbox` | 4000 | 라이트박스 |
| `--z-toast` | 5000 | 토스트 알림 |

새 컴포넌트 작성 시 하드코딩 대신 CSS 변수 사용 권장.

## Component Patterns

### View Component Naming
- 파일명: `*View.vue` (e.g., `HomeView.vue`)
- 루트 클래스: `.master-{kebab-name}` (e.g., `.master-home-view`)

### Carousel (vue3-carousel)
- Import: `Carousel, Slide, Navigation, Pagination`
- CSS import 필수: `import "vue3-carousel/carousel.css"`
- Gallery 패턴: 메인 carousel + 썸네일 carousel 연동 (`v-model` 공유)
- 내부 스타일 오버라이드: `:deep()` pseudo-selector 사용

### Scoped Styles
- 각 컴포넌트는 `<style scoped>` 사용
- 외부 라이브러리 스타일 오버라이드 시 `:deep()` 필수

## Auto-Import
Element Plus 컴포넌트와 API는 자동 import됨 (unplugin-auto-import, unplugin-vue-components).
직접 import 불필요.

## Commands

### Frontend
```bash
cd front
npm run dev          # 개발 서버 (http://localhost:5173)
npm run dev-host     # 외부 접근 가능 개발 서버
npm run build        # 프로덕션 빌드 (type-check 포함)
npm run lint         # oxlint + eslint (순차 실행)
```

### Backend
```bash
cd back
npm run dev              # nodemon 개발 서버 (http://localhost:3000)
npm run build            # TypeScript 컴파일
npx prisma generate      # Prisma Client 생성 (최초 1회 / 스키마 변경 시)
npx prisma migrate dev --name <설명>  # 마이그레이션 생성 + 적용
npx prisma db seed       # 시드 데이터 삽입
npx prisma studio        # DB GUI 뷰어 (브라우저)
```

## Key Conventions
1. **이미지 경로**: `public/assets/` 하위에 저장, 코드에서 `/assets/...`로 참조
2. **Object-fit 그림자**: `contain`/`cover` 이미지에 그림자 적용 시 `box-shadow` 대신 `filter: drop-shadow()` 사용
3. **알리아스**: `@/` = `src/` 폴더
4. **API 서비스**: `api/` 폴더에 도메인별 파일로 분리, `api/client.ts`의 `api()` 함수 사용
5. **인증 확인**: 관리자 전용 UI는 `authStore.isAdmin`으로 조건부 렌더링
6. **환경변수**: 프론트 `VITE_*`, 백엔드 `.env` (dotenv)
