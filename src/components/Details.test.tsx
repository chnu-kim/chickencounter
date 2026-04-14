import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { Details } from './Details'
import { expectNoA11yViolations } from '../test-utils'

describe('Details a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <Details
        startDate={new Date('2026-03-30T00:00:00+09:00')}
        excludedDay="화요일"
      />,
    )
    await expectNoA11yViolations(container)
  })
})
