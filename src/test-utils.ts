import { axe } from 'vitest-axe'

export async function expectNoA11yViolations(container: Element): Promise<void> {
  const result = await axe(container, {
    rules: {
      // 페이지 단위 규칙 — 컴포넌트 단위 테스트에서는 적용 불가
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
      // jsdom은 실제 스타일/canvas를 지원하지 않아 의미 없는 검사
      'color-contrast': { enabled: false },
    },
  })

  if (result.violations.length === 0) return

  const lines = result.violations.map((v) => {
    const nodeList = v.nodes.map((n) => `    - ${n.html}`).join('\n')
    return `  [${v.id}] ${v.help}\n${nodeList}`
  })
  throw new Error(`a11y violations:\n${lines.join('\n\n')}`)
}
