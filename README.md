# 치킨 적립 현황

방송 공백 동안 "화요일 제외, 1일 1치킨" 규칙으로 누적 금액을 집계하는 단일 페이지 대시보드.

**https://chnu-kim.github.io/chickencounter/**

## 규칙

- `startDate`부터 매일 KST `cutoffHour:cutoffMinute` (기본 21:05)에 1마리 적립
- `excludedDay`에 해당하는 요일은 제외 (기본값 2 = 화요일)
- 기준 메뉴: 황올반반 (`pricePerChicken`, 기본 26,500원)
- 누적 금액으로 도달 가능한 마일스톤을 여정 타임라인으로 표시
- `endDate`를 설정하면 해당일 이후 적립 중단
- `startDate`가 `null`이면 비활성 페이지 표시

## 설정

`src/data/config.json`에서 모든 값 조정:

| 키 | 설명 |
| --- | --- |
| `startDate` | 적립 시작일 (`YYYY-MM-DD`, `null`이면 비활성) |
| `endDate` | 적립 종료일 (`null`이면 무기한) |
| `excludedDay` | 제외 요일 (0=일 … 6=토, 예: 2 = 화요일) |
| `cutoffHour` / `cutoffMinute` | 일일 적립 기준 시각 (KST) |
| `pricePerChicken` | 치킨 1마리 가격 (원) |

마일스톤 목록은 `src/data/milestones.json`에서 `price` · `label` 쌍으로 관리.

## 개발

```bash
pnpm install
pnpm dev       # 개발 서버 (HMR)
pnpm build     # tsc -b 후 Vite 빌드
pnpm test      # Vitest
pnpm lint      # ESLint
pnpm preview   # 빌드 산출물 로컬 미리보기
```

## 배포

`master` 푸시 시 GitHub Actions가 테스트 → 빌드 → GitHub Pages 배포.

## 스택

React 19 · TypeScript · Vite · Vitest · CSS native nesting (다크 전용)
