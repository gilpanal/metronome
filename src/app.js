import Metronome from './metronome'
var metronome = new Metronome();
//metronome.init()
var tempo = document.getElementById('tempo');
console.log(metronome.tempo)
tempo.textContent = metronome.tempo;

var accent = document.getElementById('accent');
accent.textContent = metronome.accent;

var swing = document.getElementById('swing');
swing.textContent = metronome.swing;

var bar = document.getElementById('bar');
bar.textContent = metronome.barLength;

var playPauseIcon = document.getElementById('play-pause-icon');

var playButton = document.getElementById('play-button');
playButton.addEventListener('click', function() {
    metronome.startStop();

    if (metronome.isRunning) {
        playPauseIcon.className = 'pause';
    }
    else {
        playPauseIcon.className = 'play';
    }

});

var tempoChangeButtons = document.getElementsByClassName('tempo-change');
for (var i = 0; i < tempoChangeButtons.length; i++) {
    tempoChangeButtons[i].addEventListener('click', function() {
        metronome.tempo += parseInt(this.dataset.change);
        tempo.textContent = metronome.tempo;
    });
}

var accentChangeButtons = document.getElementsByClassName('accent-change');
for (var i = 0; i < accentChangeButtons.length; i++) {
    accentChangeButtons[i].addEventListener('click', function() {
        metronome.accent += parseInt(this.dataset.change);
        accent.textContent = metronome.accent;
    });
}

var swingChangeButtons = document.getElementsByClassName('swing-change');
for (var i = 0; i < swingChangeButtons.length; i++) {
    swingChangeButtons[i].addEventListener('click', function() {
        metronome.swing += parseInt(this.dataset.change);
        swing.textContent = metronome.swing;
    });
}

var barChangeButtons = document.getElementsByClassName('bar-change');
for (var i = 0; i < barChangeButtons.length; i++) {
    barChangeButtons[i].addEventListener('click', function() {
        metronome.barLength += parseInt(this.dataset.change);
        bar.textContent = metronome.barLength;
    });
}