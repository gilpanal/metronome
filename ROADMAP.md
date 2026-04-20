# ROADMAP

## Purpose

This roadmap is a developer-facing execution plan for improving the metronome project. It is intended to help with:

- sequencing work
- turning improvement areas into GitHub issues
- separating quick wins from design decisions
- keeping standalone-repo work distinct from Hi-Audio integration work

## Current Assessment

The repo has been validated locally with:

- `npm install`
- `npm run build`
- `npm start`

Current status:

- the production build succeeds
- the dev server starts correctly
- the project is small, understandable, and technically solid

This repo does not need a major rewrite. It needs a focused cleanup pass centered on:

- documentation clarity
- behavior semantics
- lightweight technical debt reduction
- basic tests
- clearer Hi-Audio integration boundaries

## Planning Principles

- Fix contributor confusion first.
- Resolve semantic mismatches before adding features.
- Prefer small, verifiable changes over large refactors.
- Treat Hi-Audio integration work as related but separate from standalone repo maintenance.
- Create issues that have one clear outcome and one clear owner.

## Phase 1: Documentation Accuracy And Project Clarity

Goal:
Make the repo easier to understand and reduce onboarding friction before changing behavior.

Expected outcome:
- contributors can run the app locally without confusion
- surprising behavior is documented explicitly
- the standalone-vs-Hi-Audio boundary is clear

Suggested issues:

### Issue 1. Add a "Known Limitations" section to `README.md`

Problem:
- several important behaviors are technically correct but surprising

Acceptance criteria:
- section includes `activate` being visual-only
- section includes `notesInQueue` not being pruned
- section includes worker lifecycle limitation
- section mentions lack of tests
- section frames the oscillator-based click sound as an intentional lightweight design choice, not an omission

### Issue 2. Clarify standalone repo vs Hi-Audio integration

Problem:
- maintainers may assume all behavior is shared
- in reality, UI logic is duplicated in Hi-Audio

Acceptance criteria:
- `README.md` or `HI-AUDIO.md` explicitly states that the audio engine is reused conceptually but the UI integration is maintained separately downstream

## Phase 2: Resolve Core Semantic Mismatches

Goal:
Align the product semantics with actual runtime behavior.

Expected outcome:
- UI labels and runtime behavior are no longer misleading
- maintainers understand which behaviors are intentional

Suggested issues:

### Issue 3. Decide the intended meaning of `activate`

Problem:
- current label implies sound enablement
- current implementation only affects icon state

Decision options:
- keep it visual-only and rename/relabel the control
- make it actually gate audio output

Acceptance criteria:
- final intended behavior is documented
- UI text and implementation match the chosen meaning
- icon behavior is consistent with the final `activate` design (active, playing, and stopped states are easy to distinguish)

### Issue 4. Document live-update behavior for tempo and time signature changes

Problem:
- the code handles live changes, but the semantics are not obvious

Acceptance criteria:
- docs explain how tempo, note duration, and beats-per-bar behave while running
- docs mention `prevBeatBar` and mid-cycle bar changes if that behavior remains

## Phase 3: Improve Runtime UX

Goal:
Fix incomplete or weakly communicated visual behavior.

Expected outcome:
- the app gives clearer feedback while running

Suggested issues:

### Issue 5. Redesign the visual beat indicator

Problem:
- the current blink animation is incomplete and not especially expressive

Acceptance criteria:
- a clear visual pulse behavior is defined
- CSS animation matches the chosen visual effect
- the animated property is appropriate for the icon/element being animated

## Phase 4: Clean Up Standalone Technical Debt

Goal:
Remove avoidable implementation debt without changing the overall architecture.

Expected outcome:
- less stale internal state
- clearer maintenance story
- easier future tuning

Suggested issues:

### Issue 6. Resolve `notesInQueue` ownership

Problem:
- the queue grows indefinitely
- it has no obvious consumer in the standalone repo

Decision options:
- remove it if unused
- prune it if kept for visualization/debugging

Acceptance criteria:
- queue purpose is explicitly decided
- implementation matches that decision

### Issue 7. Improve worker lifecycle handling

Problem:
- the worker is started and stopped, but not terminated

Acceptance criteria:
- standalone repo documents the lifecycle limitation clearly
- any chosen cleanup path is explicit in code or docs

### Issue 8. Extract core timing and audio constants

Problem:
- tuning values are scattered inline

Acceptance criteria:
- key values are centralized or otherwise made easier to adjust
- constants remain easy to read and reason about

## Phase 5: Add A Minimal Test Foundation

Goal:
Create a small safety net around the scheduling logic.

Expected outcome:
- timing-related refactors become safer
- core formulas have regression protection

Suggested issues:

### Issue 9. Add unit tests for timing math

Acceptance criteria:
- tests cover tempo and note-duration beat-length calculation
- tests cover beat wrap-around behavior
- tests cover `start(startTime)` phase alignment logic

### Issue 10. Add tests for live bar-change behavior

Acceptance criteria:
- tests cover `prevBeatBar`
- tests demonstrate intended behavior when `beatsPerBar` changes during playback

### Issue 11. Add a mocked `AudioContext` test for scheduler behavior

Acceptance criteria:
- scheduler behavior is exercised without relying on real browser audio output
- test verifies scheduling-window logic at a basic level

## Phase 6: Hi-Audio Integration Improvements

Goal:
Reduce drift between the standalone metronome and the downstream integration.

Expected outcome:
- better sync with host transport
- cleaner lifecycle handling
- clearer maintenance strategy for duplicated UI code

Suggested issues:

### Issue 12. Wire transport phase alignment into Hi-Audio

Problem:
- Hi-Audio currently calls `startStop()` without `startTime`

Acceptance criteria:
- host transport position is passed into metronome start
- behavior is verified against expected bar/beat alignment

### Issue 13. Evaluate shared `AudioContext` usage in Hi-Audio

Problem:
- the metronome creates its own audio context instead of using the host context

Acceptance criteria:
- decision is made whether to inject host audio context
- reasoning is documented even if the answer is "not now"

### Issue 14. Terminate the worker on Hi-Audio teardown

Problem:
- modal close stops playback but does not terminate the worker

Acceptance criteria:
- worker termination strategy is implemented or lifecycle decision is documented

### Issue 15. Decide whether duplicated UI logic should remain

Problem:
- `metronomehandler.js` duplicates much of `app.js`

Decision options:
- keep duplication and document the sync burden
- gradually extract shared UI behavior

Acceptance criteria:
- maintenance strategy is explicitly chosen
- future contributors can tell where behavior changes must be applied

Note:
If extraction is chosen, the recommended direction is a shared state object and a single `render()` function that both `app.js` and `metronomehandler.js` consume. Handlers would only mutate state; DOM updates would happen in one place. This becomes more valuable if new controls are added (subdivisions, accent patterns, presets, transport indicators).

## Candidate Future Enhancements

These should not block the phases above.

Suggested issues:

### Issue 16. Add subdivision support

Examples:
- eighth-note subdivisions
- triplets
- dotted values

### Issue 17. Improve click sound design

Examples:
- configurable frequencies
- sample-based click
- accent controls

### Issue 18. Evaluate `AudioWorklet` migration

This is a later-stage architectural option, not an immediate need.

## Suggested Milestone Structure

If you want to turn this into GitHub milestones, a clean structure would be:

### Milestone 1. Developer Experience

Include:
- Issue 1
- Issue 2

### Milestone 2. Behavior Alignment

Include:
- Issue 3
- Issue 4
- Issue 5

### Milestone 3. Core Cleanup

Include:
- Issue 6
- Issue 7
- Issue 8
- Issue 9
- Issue 10
- Issue 11

### Milestone 4. Hi-Audio Sync

Include:
- Issue 12
- Issue 13
- Issue 14
- Issue 15

### Milestone 5. Future Features

Include:
- Issue 16
- Issue 17
- Issue 18

## Recommended Next Step

The best immediate move is to create the first three GitHub issues:

1. Add a known limitations section.
2. Decide the intended meaning of `activate`.
3. Resolve `notesInQueue`: remove it or prune it.

Those three decisions will reduce the most ambiguity for the least implementation effort.
