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

- behavior semantics
- lightweight technical debt reduction
- basic tests
- clearer Hi-Audio integration boundaries

## Planning Principles

- Resolve semantic mismatches before adding features.
- Prefer small, verifiable changes over large refactors.
- Treat Hi-Audio integration work as related but separate from standalone repo maintenance.
- Create issues that have one clear outcome and one clear owner.

## Phase 1: Resolve Core Semantic Mismatches

Goal:
Align the product semantics with actual runtime behavior.

Expected outcome:
- UI labels and runtime behavior are no longer misleading
- maintainers understand which behaviors are intentional

Suggested issues:

### Issue 1. Decide the intended meaning of `activate`

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

### Issue 2. Document runtime live-update behavior for beats-per-bar changes

Problem:
- the static formula and note-duration behavior are covered in README.md
- the runtime semantics of live changes are not yet documented: `prevBeatBar` purpose, what happens when `beatsPerBar` changes mid-cycle, and whether partially-elapsed bars are truncated or completed

Acceptance criteria:
- docs explain `prevBeatBar` and the mid-cycle bar-change behavior
- intended behavior (truncate vs. complete current bar) is explicitly decided and stated

## Phase 2: Improve Runtime UX

Goal:
Fix incomplete or weakly communicated visual behavior.

Expected outcome:
- the app gives clearer feedback while running

Suggested issues:

### Issue 3. Redesign the visual beat indicator

Problem:
- the current blink animation is incomplete and not especially expressive

Acceptance criteria:
- a clear visual pulse behavior is defined
- CSS animation matches the chosen visual effect
- the animated property is appropriate for the icon/element being animated

## Phase 3: Clean Up Standalone Technical Debt

Goal:
Remove avoidable implementation debt without changing the overall architecture.

Expected outcome:
- less stale internal state
- clearer maintenance story
- easier future tuning

Suggested issues:

### Issue 4. Resolve `notesInQueue` ownership

Problem:
- the queue grows indefinitely
- it has no obvious consumer in the standalone repo

Decision options:
- remove it if unused
- prune it if kept for visualization/debugging

Acceptance criteria:
- queue purpose is explicitly decided
- implementation matches that decision

### Issue 5. Implement worker lifecycle handling

Problem:
- the worker is started and stopped but never terminated — this is now documented as a known limitation in README.md
- no cleanup code exists; the worker thread lives for the entire page lifetime

Acceptance criteria:
- a termination strategy is chosen and implemented (or explicitly deferred with reasoning)
- standalone app calls `timerWorker.terminate()` at an appropriate point, or documents why it intentionally does not

### Issue 6. Extract core timing and audio constants

Problem:
- tuning values are scattered inline

Acceptance criteria:
- key values are centralized or otherwise made easier to adjust
- constants remain easy to read and reason about

## Phase 4: Add A Minimal Test Foundation

Goal:
Create a small safety net around the scheduling logic.

Expected outcome:
- timing-related refactors become safer
- core formulas have regression protection

Suggested issues:

### Issue 7. Add unit tests for timing math

Acceptance criteria:
- tests cover tempo and note-duration beat-length calculation
- tests cover beat wrap-around behavior
- tests cover `start(startTime)` phase alignment logic

### Issue 8. Add tests for live bar-change behavior

Acceptance criteria:
- tests cover `prevBeatBar`
- tests demonstrate intended behavior when `beatsPerBar` changes during playback

### Issue 9. Add a mocked `AudioContext` test for scheduler behavior

Acceptance criteria:
- scheduler behavior is exercised without relying on real browser audio output
- test verifies scheduling-window logic at a basic level

## Phase 5: Hi-Audio Integration Improvements

Goal:
Reduce drift between the standalone metronome and the downstream integration.

Expected outcome:
- better sync with host transport
- cleaner lifecycle handling
- clearer maintenance strategy for duplicated UI code

Suggested issues:

### Issue 10. Wire transport phase alignment into Hi-Audio

Problem:
- Hi-Audio currently calls `startStop()` without `startTime`

Acceptance criteria:
- host transport position is passed into metronome start
- behavior is verified against expected bar/beat alignment

### Issue 11. Evaluate shared `AudioContext` usage in Hi-Audio

Problem:
- the metronome creates its own audio context instead of using the host context

Acceptance criteria:
- decision is made whether to inject host audio context
- reasoning is documented even if the answer is "not now"

### Issue 12. Terminate the worker on Hi-Audio teardown

Problem:
- modal close stops playback but does not terminate the worker

Acceptance criteria:
- worker termination strategy is implemented or lifecycle decision is documented

### Issue 13. Act on the duplicated UI logic maintenance strategy

Problem:
- `metronomehandler.js` duplicates much of `app.js` — this is now documented in README.md and HI-AUDIO.md
- no decision has been made or recorded about whether to keep the duplication or extract shared behavior

Decision options:
- keep duplication and add an explicit sync checklist to HI-AUDIO.md
- gradually extract shared UI behavior into a common state object and `render()` function

Acceptance criteria:
- maintenance strategy is explicitly chosen and recorded
- future contributors can tell where behavior changes must be applied

Note:
If extraction is chosen, the recommended direction is a shared state object and a single `render()` function that both `app.js` and `metronomehandler.js` consume. Handlers would only mutate state; DOM updates would happen in one place. This becomes more valuable if new controls are added (subdivisions, accent patterns, presets, transport indicators).

## Candidate Future Enhancements

These should not block the phases above.

Suggested issues:

### Issue 14. Add subdivision support

Examples:
- eighth-note subdivisions
- triplets
- dotted values

### Issue 15. Improve click sound design

Examples:
- configurable frequencies
- sample-based click
- accent controls

### Issue 16. Evaluate `AudioWorklet` migration

This is a later-stage architectural option, not an immediate need.

## Suggested Milestone Structure

If you want to turn this into GitHub milestones, a clean structure would be:

### Milestone 1. Behavior Alignment

Include:
- Issue 1
- Issue 2
- Issue 3

### Milestone 2. Core Cleanup

Include:
- Issue 4
- Issue 5
- Issue 6
- Issue 7
- Issue 8
- Issue 9

### Milestone 3. Hi-Audio Sync

Include:
- Issue 10
- Issue 11
- Issue 12
- Issue 13

### Milestone 4. Future Features

Include:
- Issue 14
- Issue 15
- Issue 16

## Recommended Next Step

The best immediate move is to create these three GitHub issues:

1. Decide the intended meaning of `activate` (Issue 1).
2. Resolve `notesInQueue`: remove it or prune it (Issue 4).
3. Document live-update behavior for tempo and time signature changes (Issue 2).

Those three decisions will reduce the most ambiguity for the least implementation effort.
