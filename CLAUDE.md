# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow (MUST FOLLOW — 최우선 규칙)

이 규칙은 다른 모든 지침보다 우선한다. 예외 없이 지킬 것.

- **master 브랜치 및 메인 worktree에서 직접 작업 금지.** 어떤 변경도 전용 브랜치 + 전용 worktree에서만 수행
- **모든 작업은 시작 전에 새 worktree를 생성**해 물리적으로 격리한다 (한 worktree = 한 브랜치 = 한 목적)
  - 새 작업 시작: `git worktree add ../chickencounter-<topic> -b <type>/<topic>`
  - 작업 종료 후 정리: `git worktree remove ../chickencounter-<topic>`
- **서브에이전트 위임 시 반드시 `isolation: "worktree"` 옵션 사용**
- 작업 시작 전 항상 `git status` + `git worktree list`로 현재 위치 확인
- **PR 머지 후 즉시 정리**: `git worktree remove <path>` → 로컬 브랜치 삭제(`-d` 머지됨 / `-D` squash) → `git remote prune origin`. 미완료 작업이 남은 브랜치는 사용자에게 확인 후 처리
- 이 규칙을 어길 것 같으면 작업을 멈추고 사용자에게 먼저 확인할 것

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