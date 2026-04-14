import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { StatusMessage } from './StatusMessage'
import { expectNoA11yViolations } from '../test-utils'

describe('StatusMessage a11y', () => {
  it('Tuesday message has no axe violations', async () => {
    const { container } = render(<StatusMessage isTuesday={true} />)
    await expectNoA11yViolations(container)
  })
})
