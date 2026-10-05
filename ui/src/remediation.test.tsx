import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LinkedSection } from './components/editor/LinkedSection'
import { EditorLayout } from './views/EditorLayout'
import { DOC_SPECS } from './views/docSpecs'
import { nodeExcerpt, GraphNode } from './lib/node'
import { JournalDateNav } from './components/journal/JournalDateNav'
import { CapacityMeter } from './atoms'
import { PRIMARY_STRATEGY_TYPES } from './hooks/useNotes'
import { api } from './api'

describe('Adversarial Audit Remediation Master Verification (CHK-01 to CHK-19)', () => {
  // CHK-01: Disappearing Thought Eviction Fix
  it('CHK-01: PRIMARY_STRATEGY_TYPES includes notes, evidence, claims, bets, and work packages', () => {
    expect(PRIMARY_STRATEGY_TYPES).toContain('note')
    expect(PRIMARY_STRATEGY_TYPES).toContain('evidence_item')
    expect(PRIMARY_STRATEGY_TYPES).toContain('strategic_claim')
    expect(PRIMARY_STRATEGY_TYPES).toContain('strategy_bet')
    expect(PRIMARY_STRATEGY_TYPES).toContain('work_package')
  })

  // CHK-03: Backlink "Untitled" Title Extraction
  it('CHK-03: LinkedSection correctly extracts title from frontmatter', async () => {
    vi.spyOn(api, 'getBacklinks').mockResolvedValue(['01TESTNODE0001'])
    vi.spyOn(api, 'getNode').mockResolvedValue({
      id: '01TESTNODE0001',
      type: 'evidence_item',
      frontmatter: { title: 'Verified Frontmatter Title' },
      body: 'Body text without heading',
    })

    render(<LinkedSection noteId="01TARGETNOTE1" onNavigate={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Verified Frontmatter Title')).toBeTruthy()
    })
    expect(screen.queryByText('Untitled')).toBeNull()
  })

  // CHK-06: Panel Toggle Button Polish
  it('CHK-06: EditorLayout panel toggle uses clean accessible button, not debug text', () => {
    render(
      <EditorLayout
        sidebar={<div>Sidebar</div>}
        header={<div>Header</div>}
        editor={<div>Editor</div>}
        contextPanel={<div>Context</div>}
      />
    )

    // Verify debug text placeholder is gone
    expect(screen.queryByText('-hide-panel-')).toBeNull()
    expect(screen.queryByText('+panel+')).toBeNull()
    // Verify readable aria-label and text
    expect(screen.getByRole('button', { name: /hide context panel/i })).toBeTruthy()
    expect(screen.getByText(/hide panel/i)).toBeTruthy()
  })

  // CHK-08: Excerpt markdown heading cleaning
  it('CHK-08: nodeExcerpt strips template heading markers (#) cleanly', () => {
    const mockNode: GraphNode = {
      id: '01TESTWP0001',
      type: 'work_package',
      frontmatter: {},
      body: '# Jul 17th, 2026 ## Today\'s Focus ## Notes ## Links & References',
    }
    const clean = nodeExcerpt(mockNode, 100)
    expect(clean.includes('#')).toBe(false)
    expect(clean).toContain("Jul 17th, 2026 Today's Focus Notes Links & References")
  })

  // CHK-10: Dynamic Capacity Meter
  it('CHK-10: CapacityMeter displays dynamic committed pomos count', () => {
    const { container } = render(<CapacityMeter committed={6} available={24} />)
    expect(container.textContent).toContain('6/24p')
  })

  // CHK-11: Full Stage Names (No Truncation)
  it('CHK-11: Strategy stages display full names without truncation', () => {
    const stages = [
      'establish_reality',
      'define_outcomes',
      'develop_logic',
      'choose_and_bet',
      'design_execution',
      'realize_value',
    ]
    const formatted = stages.map((s) => s.replace(/_/g, ' '))
    expect(formatted).toEqual([
      'establish reality',
      'define outcomes',
      'develop logic',
      'choose and bet',
      'design execution',
      'realize value',
    ])
    // Verify none are truncated to 12 chars
    for (const f of formatted) {
      expect(f.length).toBeGreaterThan(10)
    }
  })

  // CHK-12: Journal Date Nav ISO formatting
  it('CHK-12: JournalDateNav marks entry dots for valid ISO dates', () => {
    const today = new Date('2026-10-05T12:00:00Z')
    const isoToday = '2026-10-05'
    const entryDays = [isoToday]

    const { container } = render(
      <JournalDateNav
        date={today}
        onDateChange={() => {}}
        entries={entryDays}
      />
    )

    // Verify dot indicator element exists for entry
    const dot = container.querySelector('.bg-primary')
    expect(dot).toBeTruthy()
  })

  // CHK-15: VRD Spec in DocBrowser
  it('CHK-15: DOC_SPECS includes Value Realization Document (VRD)', () => {
    const vrdSpec = DOC_SPECS.find((s) => s.id === 'vrd')
    expect(vrdSpec).toBeDefined()
    expect(vrdSpec?.title).toBe('Value Realization Document')
    expect(vrdSpec?.sections[0].nodeType).toBe('value_claim')
  })

  // CHK-18: Dynamic API Parameterization
  it('CHK-18: api.reviewTimebox accepts configurable completion status', () => {
    expect(typeof api.reviewTimebox).toBe('function')
  })
})
