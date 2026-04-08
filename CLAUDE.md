# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start Vite dev server with HMR
- `pnpm build` — type-check with `tsc -b` then build with Vite
- `pnpm lint` — run ESLint across the project
- `pnpm preview` — preview the production build locally

## Architecture

React 19 + TypeScript + Vite SPA. 2026-03-30 이후 방송 공백을 "화요일 제외, 1일 1치킨" 규칙으로 누적 집계하는 단일 페이지 대시보드.

- `src/main.tsx` — entry point, renders `<App />` with StrictMode
- `src/App.tsx` — 대시보드 컴포지션 (MainCounter, MetadataPanel, SupplementaryInfo, StatusMessage)
- `src/utils/chickenCounter.ts` — 순수 계산 로직 (React 의존 없음). 시작일, 화요일 제외, 치킨 수 계산
- `src/hooks/useChickenCount.ts` — 계산 훅 + 자정 자동 갱신 (setTimeout 체이닝)
- `src/components/` — 4개 컴포넌트 각각 .tsx + .css 쌍
- `src/index.css` — 다크 전용 테마 토큰 (CSS custom properties)
- `src/App.css` — 대시보드 레이아웃

## Style Notes

- 다크 전용 테마 (prefers-color-scheme 미사용)
- CSS native nesting + custom properties (no preprocessor)
- BEM-style 클래스명 (예: `main-counter__number`)
- ESLint config: recommended TS rules + react-hooks + react-refresh plugins