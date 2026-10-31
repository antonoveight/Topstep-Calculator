# The Funded Angler · Trading Desk

The October 2026 interface uses graphite surfaces, restrained teal accents and
semantic profit/loss colors. Both dark and light modes share the same layout.

`assets/desk-ui.css` defines the presentation after the legacy styles.
`assets/desk-ui.js` arranges the existing controls once on window load, after
the workspace and pond have initialized. It preserves all original element IDs
and their handlers. It does not own account data, change the ledger, alter the
checklist conditions or infer financial outcomes.

- The overview shows balance, cumulative PnL, MLL buffer and the existing
  stage-specific target/payout value. Amounts use USD. The buffer mirrors the
  original risk display; the existing renderer owns its calculation.
- The decorative payment card is replaced with an account summary. Its original
  renderer IDs remain available, including metadata and stage-specific actions.
- Journal and risk navigation scroll to the existing sections on the overview.
  The calculator uses an expanded input/result layout below the main grid.
- Account administration, theme, notifications and backup actions are grouped
  in an accessible native settings dialog. Opening a legacy account/pricing
  modal closes the settings dialog first to avoid overlapping modal layers.
- Desktop uses the sidebar; narrow screens use a horizontally scrollable
  navigation strip. The market timeline has its own horizontal scrolling region
  rather than widening the application on mobile.
- Pond styling is scoped to regular mode. Studio and fullscreen retain their
  scene geometry and four outcome controls. Bias guidance is collapsed while
  the existing bias choices and checklist stay available.

Validation: `node tests/desk-ui.cjs`, `node tests/review.cjs`,
`node tests/workspace.cjs`, plus the pond layout/fullscreen/studio regression
checks. Screenshots in ignored `output/ui-review/` use isolated test data and
are not records from the user's browser.

Continue editing `index.html` and synchronize `topstep.html` with
`node tools/sync-html.cjs`. Publishing uses the existing GitHub Pages repository.
