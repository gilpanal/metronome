export default class Metronome {

    audioContext = null;
    notesInQueue = [];         // notes that have been put into the web audio and may or may not have been played yet {note, time}
    //currentBeatInBar = 0;
    currentQuarterNote = 0;
    //beatsPerBar = 4;
    tempo = 120;
    lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
    scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
    nextNoteTime = 0.0;     // when the next note is due
    isRunning = false;
    intervalID = null;
    timerWorker = null;
    swing = 50; // a value for "swing" between zero and one hundred
    accent = 8;
    barLength = 9;
    currentEighthNote = 0

    init() {
        this.timerWorker = new Worker(
            new URL('worker.js', import.meta.url),
            { type: 'module' }
        )

        this.timerWorker.onmessage = (e) => {
            if (e.data === "tick") {
                // Use 'this' to refer to the instance
                this.scheduler();
            } else {
                console.log("message: " + e.data);
            }
        };

        this.timerWorker.postMessage({ "interval": this.lookahead });
    }

    nextNote() {
        var sw = this.swing / 100
        // Advance current note and time by a quarter note (crotchet if you're posh)
        var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
        //this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

        //var nextAnd = secondsPerBeat * (this.Swing / 100)
        //var nextBeat = secondsPerBeat * ((100 - this.Swing) / 100)
        if (this.currentEighthNote == 0) {
            this.nextNoteTime += secondsPerBeat * sw;
            console.log("beat")
        }
        else {
            // this.nextNoteTime += nextBeat
            console.log("and")
            this.nextNoteTime += secondsPerBeat * (1 - sw);

        }
        // this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time


        this.currentQuarterNote++;    // Advance the beat number, wrap to zero
        if (this.currentQuarterNote == (this.barLength)) {
            this.currentQuarterNote = 0;
            console.log("here")
        }

        if (this.currentEighthNote == 0) {
            this.currentEighthNote = 1
        }
        else { this.currentEighthNote = 0 }
    }

    scheduleNote(beatNumber, time) {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });

        // create an oscillator
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        if (this.currentQuarterNote == 0) { osc.frequency.value = 2000 }
        else {
            osc.frequency.value = (beatNumber % this.accent == 0) ? 1000 : 800;
        }
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);

        osc.start(time);
        osc.stop(time + 0.03);
    }

    scheduler() {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            //this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            this.nextNote();
        }
    }

    start() {
        if (this.isRunning) return;

        if (this.audioContext == null) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        //this.currentBeatInBar = 0;
        this.currentQuarterNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        //this.timerWorker.postMessage("start");
        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop() {
        this.isRunning = false;
        //this.timerWorker.postMessage("stop");
        clearInterval(this.intervalID);
    }

    startStop() {
        if (this.isRunning) {
            this.stop();
        }
        else {
            this.start();
        }
    }
}