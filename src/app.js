import Metronome from './metronome'
const metronome = new Metronome()

const tempo = document.getElementById('tempo')

tempo.textContent = metronome.tempo

const accent = document.getElementById('accent')
accent.textContent = metronome.accent

const swing = document.getElementById('swing')
swing.textContent = metronome.swing

const bar = document.getElementById('bar')
bar.textContent = metronome.barLength

const playPauseIcon = document.getElementById('play-pause-icon')

const playButton = document.getElementById('play-button')
playButton.addEventListener('click', function() {
    metronome.startStop()
    if (metronome.isRunning) {
        playPauseIcon.className = 'pause-icon'
    }
    else {
        playPauseIcon.className = 'play-icon'
    }
})

const tempoChangeButtons = document.querySelectorAll(`[data-id='tempo-change']`)
for (let i = 0; i < tempoChangeButtons.length; i++) {
    tempoChangeButtons[i].addEventListener('click', function() {
        metronome.tempo += parseInt(this.dataset.change)
        tempo.textContent = metronome.tempo
    })
}

const accentChangeButtons = document.querySelectorAll(`[data-id='accent-change']`)
for (let i = 0; i < accentChangeButtons.length; i++) {
    accentChangeButtons[i].addEventListener('click', function() {
        metronome.accent += parseInt(this.dataset.change)
        accent.textContent = metronome.accent
    })
}

const swingChangeButtons = document.querySelectorAll(`[data-id='swing-change']`)
for (let i = 0; i < swingChangeButtons.length; i++) {
    swingChangeButtons[i].addEventListener('click', function() {
        metronome.swing += parseInt(this.dataset.change)
        swing.textContent = metronome.swing
    })
}

const barChangeButtons = document.querySelectorAll(`[data-id='bar-change']`)
for (let i = 0; i < barChangeButtons.length; i++) {
    barChangeButtons[i].addEventListener('click', function() {
        metronome.barLength += parseInt(this.dataset.change)
        bar.textContent = metronome.barLength
    })
}

metronome.init()