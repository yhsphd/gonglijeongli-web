# gonglijeongli-web

[동방 프로젝트 서클 공리와정리](https://twitter.com/gonglijeongli)의 공식 웹사이트입니다.

## 웹사이트 주소

https://gonglijeongli.yhsphd.com

## 기능

- 작품 관리
- 이벤트 관리
- 공지사항 관리
- 갤러리 관리

## 기술 스택

### Frontend

- **Vue 3** (Composition API)
- **Vite** (Build Tool)
- **TypeScript**
- **Pinia** (State Management) & **Vue Router**
- **Element Plus** (UI Component Library)
- **Tiptap** (Rich Text Editor)

### Backend

- **Node.js** & **Express**
- **TypeScript**
- **Prisma** (ORM)
- **SQLite** (Database)
- **Swagger UI** (API Documentation)

### Infrastructure & Tools

- **Monorepo** (Turborepo + npm workspaces)
- **GitHub Actions** (CI/CD)
- **OCI** (Oracle Cloud Infrastructure), **Nginx**, **PM2**

---

## 로컬 프로젝트 실행

이 프로젝트는 Turborepo와 npm workspaces를 활용한 모노레포 구조로 되어 있습니다.

1. **저장소 클론 및 패키지 설치**
   최상위 디렉터리(루트)에서 아래 명령어를 실행하여 모든 패키지를 설치합니다.

   ```bash
   npm install
   ```

2. **환경변수 설정**
   `back` 디렉터리에 `.env` 파일을 생성하고 필요한 환경변수를 입력합니다.
   (`back/.env.example` 파일을 참고하여 복사해서 사용할 수 있습니다.)

3. **개발 서버 실행**
   패키지 설정 및 환경변수 설정이 완료되면, 루트 디렉터리에서 아래 명령어로 프론트엔드와 백엔드 개발 서버를 동시에 실행할 수 있습니다.
   ```bash
   npm run dev
   ```
   > 백엔드 Prisma 데이터베이스 마이그레이션이 필요한 경우 `cd back` 이동 후 `npx prisma migrate dev` (또는 `npx prisma db push`) 명령을 먼저 실행해 주세요.

---

## 배포

본 프로젝트는 **GitHub Actions**를 기반으로 자동화된 CI/CD 파이프라인이 구축되어 있습니다.

1. **자동 배포 (권장)**
   - `master` 브랜치에 코드를 Push하거나 Merge하면 GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)가 자동으로 실행됩니다.
   - 워크플로우는 프로젝트를 빌드한 후 생성된 아티팩트를 OCI(Oracle Cloud) 서버로 전송합니다.
   - 이후 서버에서 Nginx(프론트엔드 정적 파일 제공)와 PM2(백엔드 앱 재시작)를 통해 서비스가 최신 버전으로 자동 갱신됩니다.

2. **수동 빌드**
   만약 수동으로 배포 환경을 테스트하거나 빌드 결과물을 확인하고 싶다면 루트 디렉터리에서 아래 명령어를 실행합니다.
   ```bash
   npm run build
   ```
   이 명령어는 프론트엔드 최적화 빌드 및 백엔드 트랜스파일/Swagger 문서 생성을 일괄적으로 수행합니다.
