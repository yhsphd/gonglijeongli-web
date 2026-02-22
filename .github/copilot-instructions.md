# Copilot Instructions - gonglijeongli-web

## Project Overview
멀티 워크스페이스 Vue 3 웹사이트 프로젝트 (front/back 분리). 현재 `front/` 폴더가 주요 개발 대상.

## Tech Stack
- **Framework**: Vue 3 + TypeScript + Vite 7
- **Routing**: Vue Router 5 (nested routes with DefaultLayout)
- **State**: Pinia
- **UI**: Element Plus (auto-import), vue3-carousel, Tiptap (rich text editor)
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
│   ├── components/
│   │   ├── common/       # 공통 재사용 컴포넌트
│   │   │   ├── AppHeader.vue, AppFooter.vue
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
```

### 폴더 구조 규칙
- **하위 뷰가 있는 경우**: 해당 도메인 이름의 하위 폴더에 정리 (예: `views/news/`)
- **하위 뷰 명명**: `IndexView.vue` (목록), `DetailView.vue` (상세), `WriteView.vue` (작성)

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
```bash
npm run dev          # 개발 서버
npm run dev-host     # 외부 접근 가능 개발 서버
npm run build        # 프로덕션 빌드 (type-check 포함)
npm run lint         # oxlint + eslint (순차 실행)
```

## Key Conventions
1. **이미지 경로**: `public/assets/` 하위에 저장, 코드에서 `/assets/...`로 참조
2. **Object-fit 그림자**: `contain`/`cover` 이미지에 그림자 적용 시 `box-shadow` 대신 `filter: drop-shadow()` 사용
3. **알리아스**: `@/` = `src/` 폴더
