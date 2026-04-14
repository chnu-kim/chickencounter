import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { Milestone } from './Milestone'
import { expectNoA11yViolations } from '../test-utils'

describe('Milestone a11y', () => {
  it('low total (target on first milestone) has no axe violations', async () => {
    const { container } = render(<Milestone totalPrice={5000} />)
    await expectNoA11yViolations(container)
  })

  it('mid total (target in middle) has no axe violations', async () => {
    const { container } = render(<Milestone totalPrice={500000} />)
    await expectNoA11yViolations(container)
  })

  it('all milestones achieved has no axe violations', async () => {
    const { container } = render(<Milestone totalPrice={999_999_999} />)
    await expectNoA11yViolations(container)
  })
})
