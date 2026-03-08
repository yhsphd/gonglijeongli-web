---
description: 새로운 API 엔드포인트 추가 시 필수 작업 절차
---

새로운 API를 추가할 때는 반드시 다음 단계를 순서대로 모두 수행해야 합니다:

1. **[Back] API 구현**: `back/src/routes` 및 `back/src/controllers`에 라우트와 로직 설계
2. **[Back] Swagger 명세 업데이트**: 해당 라우트에 대한 JSDoc 혹은 Swagger 주석 작성
3. **[Back] Swagger 자동 생성 테스트**: 백엔드에서 `npm run dev` 구동하여 `swagger-output.json`이 정상적으로 생성되는지 검증
4. **[Front] 타입 및 API 함수 동기화**: 업데이트된 Swagger 명세를 기반으로 프론트엔드 API 호출 계층 및 타입 업데이트
