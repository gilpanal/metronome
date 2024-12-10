import {Metronome} from './metronome'

let metronome = null

const tempoChangeHandler = () => {
    const tempo = document.getElementById('tempo')
    tempo.textContent = metronome.tempo
    const tempoChangeButtons = document.querySelectorAll(`[data-id='tempo-change']`)
    for (let i = 0; i < tempoChangeButtons.length; i++) {
        tempoChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.tempo + val_add
            if(valid_num >= 5 && valid_num <= 500){
                metronome.tempo = valid_num
                tempo.textContent = metronome.tempo
                updateMetronomeBlink()
            }
        })
    }
}

const beatsperbarChangeHandler = () => {
    const beatsperbar = document.getElementById('beatsperbar')
    beatsperbar.textContent = metronome.beatsPerBar
    const beatsperbarChangeButtons = document.querySelectorAll(`[data-id='beatsperbar-change']`)
    for (let i = 0; i < beatsperbarChangeButtons.length; i++) {
        beatsperbarChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.beatsPerBar + val_add
            if(valid_num >= 1 && valid_num <= 50){
                metronome.beatsPerBar = valid_num
                beatsperbar.textContent = metronome.beatsPerBar
                document.getElementById('topnumbersignature').textContent = metronome.beatsPerBar
                updateMetronomeBlink()
            }
        })
    }
}

const notes_duration_symbols = {1:'\uE1D2', 2:'\uE1D3', 4:'\uE1D5', 8:'\uE1D7',16:'\uE1D9'} //Standard Music Font Layout: Unicode for musical symbols
const noteDurationChangeHandler = () => {
    const notedurationselectable = document.getElementById('notedurationselectable')
    notedurationselectable.onchange = () => {
        metronome.noteDuration = notedurationselectable.value
        document.getElementById('bottomnumbersignature').textContent = notedurationselectable.value
        document.getElementById('noteMusicSymbol').textContent = notes_duration_symbols[notedurationselectable.value]
        updateMetronomeBlink()
    }
}

const updateMetronomeBlink = () => {
    if(metronome.isRunning){
        const secondsPerBeat = (60 / metronome.tempo) * (4 / metronome.noteDuration)
        const blinkDuration = secondsPerBeat
        const icon = document.getElementById('metronome-fonticon')
        icon.style.animation = `blink ${blinkDuration}s infinite`
    }
}

const animateMetronomeIcon = () => {
    document.getElementById('metronome-fonticon').classList.remove('text-success')
    document.getElementById('metronome-fonticon').classList.add('text-warning')
    updateMetronomeBlink()
}

const stopMetronomeIcon = () => {
    document.getElementById('metronome-fonticon').classList.remove('text-warning')
    if(metronome.activate){
        document.getElementById('metronome-fonticon').classList.add('text-success')
    }
    const icon = document.getElementById('metronome-fonticon')
    icon.style.animation = 'none'
}

const playButtonHandler = () => {
    
    const playPauseIcon = document.getElementById('play-pause-icon')
    metronome.startStop()
    if (metronome.isRunning) {
        playPauseIcon.className = 'pause-metronome-icon'
    }
    else {
        playPauseIcon.className = 'play-metronome-icon'
    }
}

const activationHandler = () => {
    metronome.activate = !metronome.activate
    if(metronome.activate){
        document.getElementById('metronome-fonticon').classList.add('text-success')
    } else {
        document.getElementById('metronome-fonticon').classList.remove('text-success')
    }
}

const startMetronome = () => {
    if (!metronome) {
        metronome = new Metronome()
        metronome.init()
        metronome.callback_start = animateMetronomeIcon
        metronome.callback_stop = stopMetronomeIcon
    }
    const metronomeSwitch = document.getElementById('metronomeSwitch')    
    metronomeSwitch.checked = metronome.activate
    
    document.getElementById('play-button').onclick = playButtonHandler
    tempoChangeHandler()
    beatsperbarChangeHandler()
    noteDurationChangeHandler()
    metronomeSwitch.onclick = activationHandler
    document.getElementById('topnumbersignature').textContent = metronome.beatsPerBar
    document.getElementById('bottomnumbersignature').textContent = metronome.noteDuration
    document.getElementById('notedurationselectable').value = metronome.noteDuration
    document.getElementById('noteMusicSymbol').textContent = notes_duration_symbols[metronome.noteDuration]
}

startMetronome()