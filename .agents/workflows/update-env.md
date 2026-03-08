---
description: 환경 변수 추가 및 변경 시 필수 작업 절차
---

새로운 환경 변수가 필요할 때는 서버 크래시나 배포 실패를 막기 위해 다음을 확인합니다:

1. **.env 적용**: 로컬 `.env` 파일에 변수 추가
2. **.env.example 동기화**: 민감한 값을 제외한 키를 `.env.example`에 반드시 추가
3. **Schema 검증**: `back/src/config/env.ts`의 Zod 객체에 새 변수 프로퍼티 및 필수 여부 추가
4. **CI/CD Secrets 확인**: GitHub Actions 등 배포 파일(`deploy.yml` 등)에 새로 추가된 변수 맵핑이 필요한지 확인 후 반영
