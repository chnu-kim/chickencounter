# 치킨 적립 현황

2026-03-30 이후 방송 공백을 화요일 제외, 1일 1치킨 규칙으로 누적 집계하는 대시보드.

**https://chnu-kim.github.io/chickencounter/**

## 규칙

- 시작일: 2026-03-30
- 매일 KST 21:05 기준 1마리 적립
- 화요일은 제외
- 기준 메뉴: 황올반반 (26,500원)
- `END_DATE_KST`에 날짜를 설정하면 해당일 이후 적립 중단

## 개발

```bash
pnpm install
pnpm dev       # 개발 서버
pnpm build     # 빌드
pnpm test      # 테스트
pnpm lint      # 린트
```

## 스택

React 19 · TypeScript · Vite · Vitest
