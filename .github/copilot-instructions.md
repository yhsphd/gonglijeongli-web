# Copilot Instructions - gonglijeongli-web

## Project Overview
멀티 워크스페이스 Vue 3 웹사이트 프로젝트 (front/back 분리). 현재 `front/` 폴더가 주요 개발 대상.

## Tech Stack
- **Framework**: Vue 3 + TypeScript + Vite 7
- **Routing**: Vue Router 5 (nested routes with DefaultLayout)
- **State**: Pinia
- **UI**: Element Plus (auto-import), vue3-carousel
- **Linting**: ESLint + oxlint, Prettier

## Project Structure
```
front/
├── src/
│   ├── layouts/          # DefaultLayout wraps all routes
│   ├── views/            # Page components (HomeView, AboutView, etc.)
│   ├── components/
│   │   ├── common/       # AppHeader, AppFooter
│   │   └── home/         # Home-specific: HeroCarousel, GalleryCarousel, ListBox
│   ├── assets/
│   │   └── styles/       # root.css (CSS variables), main.css
│   └── router/           # Nested routes under DefaultLayout
└── public/assets/        # Static images (hero/, gallery/, events/, news/)
```

## CSS Variable System
모든 스타일링은 `src/assets/styles/root.css`에 정의된 CSS 변수 사용:
- **Spacing**: `--spacing-xs` ~ `--spacing-2-5xl`
- **Colors**: `--color-text-*`, `--color-bg-*`, `--color-border`
- **Components**: `--hero-height`, `--hero-margin`, `--entry-height`, etc.
- **Effects**: `--blur-sm`, `--blur-md`, `--shadow-sm`, `--shadow-md`

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
