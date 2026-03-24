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

---

## 프로덕션 서버 환경 설정 (초기 세팅)

프로덕션 서버를 처음 구축하기 위해서는 서버 상의 환경 구축과 설정을 수동으로 해야 합니다.
본 프로젝트는 **Ubuntu + Nginx + PM2 + Node.js** 환경을 기준으로 설계되었습니다.

### 1. 배포 경로 및 디렉터리 권한 설정

GitHub Actions 스크립트가 배포를 수행하기 위해 아래와 같은 디렉터리가 필요합니다.

```bash
# GitHub Actions가 소스코드를 배포할 임시/운영 폴더 및 데이터 폴더
mkdir -p /home/ubuntu/gonglijeongli-web
mkdir -p /home/ubuntu/gonglijeongli-data/uploads
```

### 2. Github Actions 환경 변수 및 Secrets 설정

| 타입      | 이름                   | 예시 설명                                                 |
| --------- | ---------------------- | --------------------------------------------------------- |
| Variables | `OCI_HOST`             | 배포 서버 IP 또는 도메인                                  |
| Variables | `OCI_USERNAME`         | SSH 접속 유저 (예: `ubuntu`)                              |
| Variables | `OCI_DEPLOY_PATH`      | 애플리케이션 코드가 배포될 경로 (예: `/home/ubuntu`)      |
| Variables | `CORS_ALLOWED_ORIGINS` | 백엔드 허용 주소 (예: `https://gonglijeongli.yhsphd.com`) |
| Variables | `CORS_ALLOWED_DOMAIN`  | 백엔드 허용 메인 도메인 (예: `yhsphd.com`)                |
| Secrets   | `OCI_SSH_KEY`          | 배포 서버 SSH Private Key                                 |
| Secrets   | `SESSION_SECRET`       | 백엔드 Session 구성용 시크릿                              |
| Secrets   | `ADMIN_USERNAME`       | 어드민 로그인 아이디                                      |
| Secrets   | `ADMIN_PASSWORD`       | 어드민 로그인 비밀번호                                    |

### 3. Nginx 설정

서버의 `/etc/nginx/sites-available/gonglijeongli` 파일을 생성하고 아래와 같이 설정한 후, `sites-enabled`에 심볼릭 링크를 연결하여 Nginx를 리로드합니다. 인증서 발급은 Let's Encrypt (Certbot)를 활용하는 것을 권장합니다.

```nginx
server {
    listen 80;
    server_name gonglijeongli.yhsphd.com;
    # HTTPS로 리다이렉트 (Certbot에 의해 자동 설정될 수 있음)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name gonglijeongli.yhsphd.com;

    # SSL 인증서 경로 (Let's Encrypt가 적용한 경로로 수정해야 함)
    ssl_certificate /etc/nginx/ssl/gonglijeongli.crt;
    ssl_certificate_key /etc/nginx/ssl/gonglijeongli.key;

    # 프론트엔드 정적 웹 서버 (GitHub Actions가 심볼릭 링크를 이 위치로 지정함)
    location / {
        root /var/www/gonglijeongli;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시 패스 (PM2로 구동 중인 로컬 백엔드 서버)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 사용자 업로드 이미지 (백엔드에서 데이터베이스와 무관하게 저장하는 정적 이미지 폴더)
    location /uploads {
        # OCI 서버 상의 실제 업로드 경로 (OCI_DEPLOY_PATH/gonglijeongli-data)
        alias /home/ubuntu/gonglijeongli-data/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

> **주의:** `/var/www/gonglijeongli` 경로는 Nginx가 읽을 수 있어야 하며, 배포 스크립트가 해당 경로에 프론트엔드 빌드 결과물을 심볼릭 링크로 배포합니다. `alias /home/ubuntu/gonglijeongli-data/uploads;` 경로 또한 Nginx 사용자가 접근할 수 있도록 상위 디렉터리 탐색 권한(`+x`)이 보장되어야 합니다.
