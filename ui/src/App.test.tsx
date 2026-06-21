// Phase 0 UI harness smoke test. Proves React+TS+Vitest compiles and renders.
// Not TDD-bound (scaffold exception per test-driven-development skill) — no
// behavior is being specified here, only that the harness runs.
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the StrategyNotes shell heading', () => {
    render(<App />)
    expect(screen.getByText('StrategyNotes')).toBeTruthy()
  })
})
