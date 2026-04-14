import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MainCounter } from './MainCounter'
import { expectNoA11yViolations } from '../test-utils'

describe('MainCounter a11y', () => {
  it('zero count has no axe violations', async () => {
    const { container } = render(<MainCounter count={0} totalPrice={0} />)
    await expectNoA11yViolations(container)
  })

  it('large count has no axe violations', async () => {
    const { container } = render(<MainCounter count={123} totalPrice={2460000} />)
    await expectNoA11yViolations(container)
  })
})
