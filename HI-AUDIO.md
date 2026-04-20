# Hi-Audio Integration Guide

This document describes how the metronome is integrated into [Hi-Audio](https://hiaudio.fr), the open-source, collaborative browser-based DAW. It is intended for developers working on the Hi-Audio platform or building similar host/plugin integrations.

The integration lives in `hiaudio_webapp/src/pages/composition/scripts/metronome/`, which mirrors the standalone repo's structure with one additional file: `metronomehandler.js`.

---

## File Overview

| File | Role |
|---|---|
| `metronome.js` | Identical to the standalone `Metronome` class — no Hi-Audio-specific changes. |
| `metronomeworker.js` | Identical to the standalone worker. |
| `metronomehandler.js` | Hi-Audio integration layer: renders the UI inside a modal, wires up event handlers, and exports the metronome instance and trigger functions. |

---

## How the Metronome is Mounted

The metronome does not live in the main composition view. It is opened as a **modal dialog** via a navbar button. The integration works in two steps:

### 1. Render the trigger button

`triggerMetronomeButton()` returns an HTML string for a `<li>` nav item. The caller inserts this into the composition page navbar.

```js
import { triggerMetronomeButton, triggerLMetronomeHandler } from './metronome/metronomehandler'

navbar.innerHTML += triggerMetronomeButton()
triggerLMetronomeHandler()  // wires up the click handler
```

### 2. Open the modal on click

`triggerLMetronomeHandler()` attaches a click handler to `#trigger-metronome-btn`. On click, `openMetronomeDialog()` calls `DynamicModal.dynamicModalDialog()` with the full metronome UI injected as an HTML string.

The `Metronome` instance is created **lazily** — only on the first time the modal is opened:

```js
if (!metronome) {
    metronome = new Metronome()
    metronome.init()
    metronome.callback_start = animateMetronomeIcon
    metronome.callback_stop = stopMetronomeIcon
}
```

This means `init()` (which spawns the Web Worker) is not called until the user first interacts with the metronome.

---

## Exported API

`metronomehandler.js` exports three symbols:

```js
export let metronome = null                // the Metronome instance (null until first modal open)
export const triggerMetronomeButton = ()   // returns navbar button HTML string
export const triggerLMetronomeHandler = () // wires click handler for the navbar button
```

Other modules in Hi-Audio can import `metronome` directly to read or set its state:

```js
import { metronome } from './metronome/metronomehandler'

// Read state
if (metronome?.isRunning) { ... }

// Sync tempo from host transport
metronome.tempo = hostBpm
metronome.beatsPerBar = timeSignatureNumerator
metronome.noteDuration = timeSignatureDenominator
```

> Always guard with optional chaining (`metronome?.`) since the instance is `null` until the modal has been opened at least once.

---

## Lifecycle

```
Composition page loads
    └─▶ triggerMetronomeButton() → inserts nav button
    └─▶ triggerLMetronomeHandler() → wires click

User opens metronome modal (first time)
    └─▶ metronome = new Metronome()
    └─▶ metronome.init()           ← Web Worker spawned here
    └─▶ callbacks registered

User presses Play inside modal
    └─▶ metronome.startStop()      ← no startTime passed; always starts from beat 0

User closes modal
    └─▶ metronomeFinishCallback()
            └─▶ if isRunning → metronome.stop()
            (Worker is NOT terminated — it stays alive for the session)

User reopens modal
    └─▶ existing instance reused, state preserved (tempo, beatsPerBar, etc.)
```

---

## `activate` Flag

The activate toggle (the switch in the modal) flips `metronome.activate` and updates the metronome icon color (green = active, default = inactive). It is **purely visual** — it does not gate or silence audio output. The `scheduleNote()` method always plays regardless of the flag value.

The flag is checked in one place: `stopMetronomeIcon()` decides whether to restore the green color after the metronome stops.

---

## Current Limitations and Improvement Opportunities

### Transport synchronization not implemented

`metronome.startStop()` is called without a `startTime` argument, so the metronome always restarts from beat 0. The standalone `Metronome.start(startTime)` supports phase-aligned starts — this is not yet wired to the Hi-Audio transport.

To implement this, pass the DAW's current playhead position:

```js
// instead of:
metronome.startStop()
// use:
metronome.startStop(hostTransport.currentTimeInSeconds)
```

### No shared AudioContext

The metronome creates its own `AudioContext` on first play. Hi-Audio likely already has a shared audio context for track playback. Using two separate contexts wastes resources and can cause synchronization issues between the metronome click and audio tracks.

To share the context, assign it before the first `start()` call:

```js
metronome.audioContext = hostAudioContext
```

This works because `audioContext` is checked with `=== null` before creation — assigning it early prevents the internal creation.

### Worker is never terminated

`metronome.timerWorker.terminate()` is never called. The worker thread lives for the entire browser session once spawned. On composition page teardown, call:

```js
metronome?.timerWorker?.terminate()
```

### `activate` does not silence audio

As noted above, toggling the activate switch does not prevent `scheduleNote()` from running. To make the flag functional, gate audio output in the scheduler:

```js
scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
        if (this.activate) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime)
        }
        this.nextNote()
    }
}
```

This keeps the internal beat counter advancing (so re-enabling stays in phase) while suppressing audio output when inactive.

### UI logic is duplicated, not shared

`metronomehandler.js` replicates most of the UI-layer behavior from the standalone `app.js`: tempo controls, beats-per-bar controls, note duration controls, icon animation, and the activation toggle. The audio engine (`metronome.js`) is shared conceptually, but the UI wiring is maintained as a separate copy.

Practical consequence: behavior fixes or UI changes in the standalone repo must be manually applied downstream in Hi-Audio.

This is acceptable while the feature set is small. If the metronome grows to include more interactive controls (subdivisions, accent patterns, presets, transport sync indicators), consider extracting a shared state object and a single `render()` function that both integrations can use. Handlers would only mutate state; the DOM update would happen in one place. This avoids the current pattern where each handler directly reads and writes the DOM, which becomes harder to keep consistent as the number of controls grows.
