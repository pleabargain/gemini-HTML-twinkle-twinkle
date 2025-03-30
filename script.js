/**
 * script.js for Responsive Animated Piano
 *
 * Features:
 * - Dynamic keyboard generation (5 octaves)
 * - Responsive layout
 * - Automated song playback with speed control and Stop button
 * - MIDI input display and playback
 * - Live display of played MIDI notes/chords
 * - MIDI recording (notes and chords) and saving
 * - Scrolling note display with chord naming (using library)
 * - Clickable notes/chords in scroller
 * - Tabbed interface (Piano / View JSON)
 * - Current song title display
 */

// --- DOM Elements ---
const noteDisplayContainer = document.getElementById('note-scroller-container');
const noteDisplayContent = document.getElementById('note-scroller-content');
const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
const songSelect = document.getElementById('song-select');
const pianoContainer = document.getElementById('piano');
const speedSlider = document.getElementById('speed-control');
const speedDisplay = document.getElementById('speed-display');
const musicJsonDisplay = document.getElementById('music-json-display');
const midiStatusDisplay = document.getElementById('midi-status');
const recordButton = document.getElementById('record-button');
const recordingIndicator = document.getElementById('recording-indicator');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const currentSongTitleDisplay = document.getElementById('current-song-title');
const liveMidiDisplay = document.getElementById('live-midi-display'); // Element to show live MIDI input

// --- Global Variables & State ---
let keys = []; // Array of piano key DOM elements
let keyElementMap = {}; // Map note names ("C4") to key DOM elements
let playbackSpeedFactor = 1.0;
let audioContext; // Web Audio API AudioContext
let midiAccess = null; // Web MIDI API access object
const activeMIDINotes = {}; // Maps MIDI note number -> { oscillator, gainNode } for stopping MIDI sounds
const currentlyHeldMIDINotes = new Set(); // Tracks currently held MIDI keys { midiNoteNumber }
let liveDisplayTimeout = null; // Timeout for clearing live MIDI display
let isRecording = false;
let recordedMIDIEvents = []; // Stores raw { type, note, midiNote, velocity, time }
let recordingStartTime = 0;
let resizeTimeout; // For debouncing window resize
let currentNoteItemIndex = -1; // For scrolling note display
let noteScrollerSpans = []; // References to spans in the scroller
let isPlaybackActive = false; // Flag for automated playback state

// --- Constants ---
const START_OCTAVE = 2;
const END_OCTAVE = 6;
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteValues = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
const REST_THRESHOLD = 180; // ms gap to be considered a rest in recordings
const CHORD_THRESHOLD = 50; // ms max time between note-ons to be grouped as a chord
const LIVE_DISPLAY_CLEAR_DELAY = 1500; // ms to wait before clearing live display

// --- Chord Library (Intervals in Semitones from Root) ---
const chordLibrary = {
    'Maj': [0, 4, 7],       'Min': [0, 3, 7],      'Dim': [0, 3, 6],      'Aug': [0, 4, 8],
    'Sus4': [0, 5, 7],     'Sus2': [0, 2, 7],
    '7': [0, 4, 7, 10],     'Maj7': [0, 4, 7, 11], 'Min7': [0, 3, 7, 10],
    'Min7b5': [0, 3, 6, 10], 'Dim7': [0, 3, 6, 9],
    '6': [0, 4, 7, 9],      'Min6': [0, 3, 7, 9],
    '9': [0, 4, 7, 10, 14], 'Maj9': [0, 4, 7, 11, 14], 'Min9': [0, 3, 7, 10, 14]
    // Add more complex chords if needed
};

// Reverse lookup for chord intervals to name
const intervalPatterns = {};
for (const name in chordLibrary) {
    intervalPatterns[chordLibrary[name].join(',')] = name;
}

// --- Note Frequencies (C2-C7) ---
const noteFrequencies = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,'C7': 2093.00
};

// --- Melodies Data ---
const twinkleMelody = [ { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 }, { note: null, duration: 300 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 300 }, { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 } ];
const maryHadALittleLambMelody = [ { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 700 }, { note: null, duration: 100 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 }, { note: 'E4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 900 } ];
const chordsExample = [ { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: "G4", duration: 400 }, { note: "A4", duration: 400 }, { note: null, duration: 100 }, { note: ["C4", "E4", "G4"], duration: 1000 } ];
const twelveBarBluesC = [ { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["G4", "B4", "D5"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["G4", "B4", "D5"], duration: 800 }, { note: null, duration: 200 } ];

const melodies = {
    'twinkle': twinkleMelody,
    'mary': maryHadALittleLambMelody,
    'chords': chordsExample,
    '12BarBluesC': twelveBarBluesC
};

// ==============================================
//          AUDIO FUNCTIONS
// ==============================================

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') { audioContext.resume(); }
            console.log("AudioContext created/resumed.");
        } catch (e) {
             console.error("Web Audio API is not supported", e);
             alert("Web Audio API is required and not supported by your browser.");
        }
    } else if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => console.log("AudioContext resumed."));
    }
}

function playNoteSound(noteName, durationMs) {
    if (!audioContext || !noteName || !noteFrequencies[noteName]) { return; }
    if (audioContext.state === 'suspended') { audioContext.resume(); }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[noteName];
    const durationSec = durationMs / 1000 / playbackSpeedFactor;
    const startTime = audioContext.currentTime;
    const stopTime = startTime + durationSec * 0.9;
    const fadeOutTime = Math.min(durationSec * 0.1, 0.05 / playbackSpeedFactor);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.5, startTime);
    gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime));
    gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);
    oscillator.start(startTime);
    oscillator.stop(stopTime);
    oscillator.onended = () => { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e){} };
}

function playMIDINoteSound(noteName, midiNoteNumber, velocity) {
    if (!audioContext || !noteName || !noteFrequencies[noteName]) { return; }
    if (audioContext.state === 'suspended') { audioContext.resume(); }
    stopMIDINoteSound(midiNoteNumber, true);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[noteName];
    const startTime = audioContext.currentTime;
    const noteGain = Math.min(0.7, (velocity / 127) * 0.7);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(noteGain, startTime);
    oscillator.start(startTime);
    activeMIDINotes[midiNoteNumber] = { oscillator, gainNode, baseGain: noteGain };
}

function stopMIDINoteSound(midiNoteNumber, forceStop = false) {
     if (!audioContext) return;
     if (audioContext.state === 'suspended') { audioContext.resume(); }
    const activeNote = activeMIDINotes[midiNoteNumber];
    if (activeNote) {
        const { oscillator, gainNode } = activeNote;
        const stopTime = audioContext.currentTime;
        const releaseTime = 0.1;
        gainNode.gain.cancelScheduledValues(stopTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime);
        if (forceStop) {
            gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + 0.01);
            oscillator.stop(stopTime + 0.02);
        } else {
             gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + releaseTime);
             oscillator.stop(stopTime + releaseTime + 0.05);
        }
        delete activeMIDINotes[midiNoteNumber];
         oscillator.onended = () => { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e) {} };
    }
}

// ==============================================
//          MIDI FUNCTIONS
// ==============================================

function midiNoteToName(midiNote) {
    if (midiNote < 0 || midiNote > 127) return null;
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = notesOrder[noteIndex];
    return noteName + octave;
}

function handleMIDIMessage(event) {
    const command = event.data[0] & 0xF0;
    const midiNoteNumber = event.data[1];
    const velocity = event.data[2];
    const noteName = midiNoteToName(midiNoteNumber);

    if (!noteName) return;
    const keyElement = keyElementMap[noteName];

    // Recording Logic
    if (isRecording) {
        const time = performance.now() - recordingStartTime;
        if (command === 0x90 && velocity > 0) { // Note On
            recordedMIDIEvents.push({ type: 'on', note: noteName, midiNote: midiNoteNumber, velocity: velocity, time: time });
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) { // Note Off
            recordedMIDIEvents.push({ type: 'off', note: noteName, midiNote: midiNoteNumber, time: time });
        }
    }

    // Live Playback/Visual Logic
    switch (command) {
        case 0x90: // Note On
            if (velocity > 0) {
                if (keyElement) keyElement.classList.add('active');
                initAudioContext();
                playMIDINoteSound(noteName, midiNoteNumber, velocity);
                currentlyHeldMIDINotes.add(midiNoteNumber); // Track held note
            } else { // Note Off (velocity 0)
                if (keyElement) keyElement.classList.remove('active');
                 stopMIDINoteSound(midiNoteNumber);
                 currentlyHeldMIDINotes.delete(midiNoteNumber); // Stop tracking
            }
            break;
        case 0x80: // Note Off
            if (keyElement) keyElement.classList.remove('active');
             stopMIDINoteSound(midiNoteNumber);
             currentlyHeldMIDINotes.delete(midiNoteNumber); // Stop tracking
            break;
    }

    // Update Live MIDI Display after any note change
    updateLiveMIDIDisplay();
}


function onMIDISuccess(access) {
    console.log("MIDI Ready!");
    midiAccess = access;
    const inputs = midiAccess.inputs.values();
    let devicesFound = 0;
    let statusText = "MIDI Devices Connected: ";
    for (let input of inputs) {
        console.log(`Found MIDI input: ID=${input.id}, Name=${input.name}, Manuf=${input.manufacturer}`);
        input.onmidimessage = handleMIDIMessage;
        statusText += `\n- ${input.name || 'Unnamed Device'} (${input.manufacturer || 'Unknown'})`;
        devicesFound++;
    }
    if (devicesFound > 0) {
        midiStatusDisplay.textContent = statusText;
        midiStatusDisplay.className = 'status-box connected';
    } else {
        midiStatusDisplay.textContent = "MIDI Ready, but no input devices found.";
         midiStatusDisplay.className = 'status-box searching';
    }
     midiAccess.onstatechange = onMIDIStateChange;
}

function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
    midiStatusDisplay.textContent = "Failed to access MIDI devices. Please grant permission.";
    midiStatusDisplay.className = 'status-box disconnected';
}

function onMIDIStateChange(event) {
    console.log(`MIDI state change: ID=${event.port.id}, Name=${event.port.name}, State=${event.port.state}, Type=${event.port.type}`);
     if (event.port.type === 'input') {
         const portName = event.port.name || 'Unnamed Device';
         if (event.port.state === 'connected') {
             midiStatusDisplay.textContent = `MIDI Device Connected: ${portName}`;
             midiStatusDisplay.className = 'status-box connected';
             event.port.onmidimessage = handleMIDIMessage;
         } else if (event.port.state === 'disconnected') {
             midiStatusDisplay.textContent = `MIDI Device Disconnected: ${portName}`;
             midiStatusDisplay.className = 'status-box searching';
             event.port.onmidimessage = null;
             let stillConnected = false;
             if(midiAccess) {
                 for (let input of midiAccess.inputs.values()) {
                     if (input.state === 'connected') {
                         stillConnected = true;
                         midiStatusDisplay.textContent = `MIDI Device Connected: ${input.name || 'Unnamed'}`;
                         midiStatusDisplay.className = 'status-box connected';
                         break;
                     }
                 }
             }
             if (!stillConnected) {
                 midiStatusDisplay.textContent = "No active MIDI input devices found.";
             }
         }
     }
}

function initializeMIDI() {
    if (navigator.requestMIDIAccess) {
        midiStatusDisplay.textContent = "Requesting MIDI access...";
        midiStatusDisplay.className = 'status-box searching';
        navigator.requestMIDIAccess({ sysex: false })
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.warn("Web MIDI API is not supported.");
        midiStatusDisplay.textContent = "Web MIDI API not supported.";
        midiStatusDisplay.className = 'status-box unsupported';
    }
}

// ==============================================
//          KEYBOARD UI FUNCTIONS
// ==============================================

function createKeyboard() {
    pianoContainer.innerHTML = '';
    keys = [];
    keyElementMap = {};
    for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {
        for (let i = 0; i < notesOrder.length; i++) {
            const noteName = notesOrder[i];
            const fullNoteName = noteName + octave;
            if (octave === END_OCTAVE && i > notesOrder.indexOf('B')) continue;
            if (!noteFrequencies[fullNoteName]) continue;
            const key = document.createElement('div');
            key.classList.add('key');
            key.dataset.note = fullNoteName;
            if (noteName.includes('#')) key.classList.add('black');
            else key.classList.add('white');
            pianoContainer.appendChild(key);
            keys.push(key);
            keyElementMap[fullNoteName] = key;
        }
    }
    const finalCNote = `C${END_OCTAVE + 1}`;
    if (noteFrequencies[finalCNote]) {
        const key = document.createElement('div');
        key.classList.add('key', 'white');
        key.dataset.note = finalCNote;
        pianoContainer.appendChild(key);
        keys.push(key);
        keyElementMap[finalCNote] = key;
    }
    requestAnimationFrame(positionBlackKeys);
    console.log(`Keyboard created with ${keys.length} keys.`);
}

function positionBlackKeys() {
     const blackKeys = pianoContainer.querySelectorAll('.key.black');
     blackKeys.forEach(blackKey => {
        const noteName = blackKey.dataset.note;
        const noteBase = noteName.substring(0, noteName.length - 1);
        const octave = noteName.slice(-1);
        const noteIndex = notesOrder.indexOf(noteBase);
        const precedingWhiteNoteName = notesOrder[noteIndex - 1] + octave;
        const precedingWhiteKey = keyElementMap[precedingWhiteNoteName];
        if (precedingWhiteKey) {
            const whiteKeyRect = precedingWhiteKey.getBoundingClientRect();
            const pianoRect = pianoContainer.getBoundingClientRect();
            const leftPosition = whiteKeyRect.left - pianoRect.left + whiteKeyRect.width * 0.65;
            blackKey.style.left = `${leftPosition}px`;
            blackKey.style.transform = 'translateX(-50%)';
        }
    });
}

function highlightPianoKeys(noteOrChord) {
    keys.forEach(key => key.classList.remove('active'));
    if (noteOrChord) {
        const notesToHighlight = Array.isArray(noteOrChord) ? noteOrChord : [noteOrChord];
        notesToHighlight.forEach(noteName => {
            const keyElement = keyElementMap[noteName];
            if (keyElement) {
                keyElement.classList.add('active');
            }
        });
    }
}

// ==============================================
//      SCROLLING DISPLAY & PLAYBACK
// ==============================================

// Chord Naming using Chord Library
function getChordName(notes) {
    if (!Array.isArray(notes)) return notes;
    if (notes.length === 0) return '';
    if (notes.length === 1) return notes[0];

    const noteClasses = [...new Set(notes.map(n => n.replace(/[0-9]/g, '')))];
    if (noteClasses.length === 0) return '';
    noteClasses.sort((a, b) => noteValues[a] - noteValues[b]);

    for (let i = 0; i < noteClasses.length; i++) { // Try each note as root
        const potentialRoot = noteClasses[i];
        const rootVal = noteValues[potentialRoot];
        const intervals = noteClasses.map(noteClass => {
            let val = noteValues[noteClass];
            let interval = val - rootVal;
            return interval < 0 ? interval + 12 : interval;
        }).sort((a, b) => a - b);
        const intervalString = intervals.join(',');
        if (intervalPatterns[intervalString]) {
            return `${potentialRoot} ${intervalPatterns[intervalString]}`; // Match found!
        }
    }
    // Fallback if no library match
    const root = noteClasses[0];
    return `${root} Chord (${noteClasses.length})`;
}

// Function to play a note/chord briefly on click (from scroller)
function playNoteItemOnClick(noteOrChord) {
    if (!noteOrChord || !audioContext) {
        if (!audioContext) console.warn("AudioContext not ready for note click.");
        return;
    }
    if (audioContext.state === 'suspended') { audioContext.resume(); }
    const notesToPlay = Array.isArray(noteOrChord) ? noteOrChord : [noteOrChord];
    const clickDuration = 400; // Fixed duration for click playback
    highlightPianoKeys(notesToPlay);
    setTimeout(() => { highlightPianoKeys(null); }, clickDuration);
    notesToPlay.forEach(noteName => {
        if (!noteFrequencies[noteName]) { return; }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const frequency = noteFrequencies[noteName];
        const durationSec = clickDuration / 1000;
        const startTime = audioContext.currentTime;
        const stopTime = startTime + durationSec * 0.9;
        const fadeOutTime = 0.05;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime));
        gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);
        oscillator.start(startTime);
        oscillator.stop(stopTime);
        oscillator.onended = () => { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e){} };
    });
}

// Populates the scrolling note display
function populateNoteScroller(melody) {
    noteDisplayContent.innerHTML = '';
    noteScrollerSpans = [];
    currentNoteItemIndex = -1;
    if (!melody || melody.length === 0) { noteDisplayContent.textContent = "No song data."; return; }
    melody.forEach((item, index) => {
        const span = document.createElement('span');
        span.classList.add('note-item');
        span.dataset.index = index;
        let displayText = '';
        if (item.note === null) {
            displayText = '—'; span.classList.add('is-rest');
        } else if (Array.isArray(item.note)) {
            displayText = getChordName(item.note); span.classList.add('is-chord');
        } else {
            displayText = item.note;
        }
        span.textContent = displayText;
        noteDisplayContent.appendChild(span);
        noteScrollerSpans.push(span);
        // Add click listener for playback
        if (item.note !== null) {
            span.addEventListener('click', () => {
                const currentMelodyKey = songSelect.value;
                const currentFullMelody = melodies[currentMelodyKey];
                if (currentFullMelody && currentFullMelody[index]) {
                    const noteDataToPlay = currentFullMelody[index].note;
                    initAudioContext();
                    playNoteItemOnClick(noteDataToPlay);
                    span.classList.add('clicked'); // Optional visual feedback
                    setTimeout(() => span.classList.remove('clicked'), 200);
                } else { console.error("Cannot find melody data for click index:", index); }
            });
        }
    });
    noteDisplayContainer.scrollTo({ left: 0, behavior: 'auto' });
}

// Updates highlighting and scrolling for the note display
function updateNoteScroller(index) {
    if (currentNoteItemIndex >= 0 && noteScrollerSpans[currentNoteItemIndex]) {
        noteScrollerSpans[currentNoteItemIndex].classList.remove('current-note-item');
    }
    if (index >= 0 && noteScrollerSpans[index]) {
        const currentSpan = noteScrollerSpans[index];
        currentSpan.classList.add('current-note-item');
        const containerWidth = noteDisplayContainer.offsetWidth;
        const spanLeft = currentSpan.offsetLeft;
        const spanWidth = currentSpan.offsetWidth;
        const desiredScrollLeft = spanLeft + spanWidth / 2 - containerWidth / 2;
        noteDisplayContainer.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
        currentNoteItemIndex = index;
    } else {
        currentNoteItemIndex = -1;
    }
}

// Delay function respecting playback speed
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms / playbackSpeedFactor));
}

// Automated song playback logic
async function playSong(melody) {
    if (isPlaybackActive) { console.log("Already playing."); return; }
    if (!audioContext || audioContext.state !== 'running') {
        await initAudioContext();
        if (!audioContext || audioContext.state !== 'running') { alert("Audio could not be started."); return; }
    }
    populateNoteScroller(melody);
    if (noteScrollerSpans.length === 0) { console.error("Cannot play: No notes loaded."); return; }

    isPlaybackActive = true;
    playButton.disabled = true; stopButton.disabled = false; songSelect.disabled = true;
    speedSlider.disabled = true; recordButton.disabled = true;

    const noteGap = 50;

    try {
        for (let i = 0; i < melody.length; i++) {
            if (!isPlaybackActive) break;
            const noteItem = melody[i];
            updateNoteScroller(i);
            highlightPianoKeys(noteItem.note);
            if (noteItem.note) {
                const notesToPlay = Array.isArray(noteItem.note) ? noteItem.note : [noteItem.note];
                notesToPlay.forEach(noteName => playNoteSound(noteName, noteItem.duration));
            }
            await delay(noteItem.duration);
            if (!isPlaybackActive) break;
            await delay(noteGap);
            if (!isPlaybackActive) break;
        }
    } finally {
        console.log("Playback loop finished or stopped.");
        isPlaybackActive = false;
        keys.forEach(key => key.classList.remove('active'));
        if (currentNoteItemIndex >= 0 && noteScrollerSpans[currentNoteItemIndex]) {
            noteScrollerSpans[currentNoteItemIndex].classList.remove('current-note-item');
        }
        noteDisplayContainer.scrollTo({ left: 0, behavior: 'smooth' });
        playButton.disabled = false; stopButton.disabled = true; songSelect.disabled = false;
        speedSlider.disabled = false; recordButton.disabled = false;
    }
}

// ==============================================
//      LIVE MIDI DISPLAY FUNCTION
// ==============================================

function updateLiveMIDIDisplay() {
    if (liveDisplayTimeout) { // Clear previous timeout if a new note event comes quickly
        clearTimeout(liveDisplayTimeout);
        liveDisplayTimeout = null;
    }

    if (currentlyHeldMIDINotes.size === 0) {
        // Schedule to clear display if no notes are held after a delay
        liveDisplayTimeout = setTimeout(() => {
             if (liveMidiDisplay) liveMidiDisplay.textContent = '--'; // Reset
        }, LIVE_DISPLAY_CLEAR_DELAY);
        return;
    }

    // Convert held MIDI numbers to note names
    const heldNoteNames = Array.from(currentlyHeldMIDINotes)
                             .map(midiNoteToName)
                             .filter(name => name !== null); // Remove potential nulls

    if (heldNoteNames.length > 0 && liveMidiDisplay) {
        liveMidiDisplay.textContent = getChordName(heldNoteNames); // Display note or chord name
    } else if (liveMidiDisplay) {
        liveMidiDisplay.textContent = '--'; // Fallback
    }
}


// ==============================================
//          RECORDING & SAVING
// ==============================================
function processRecording(rawEvents) {
    if (!rawEvents || rawEvents.length === 0) return [];
    rawEvents.sort((a, b) => a.time - b.time);
    const processedMelody = [];
    let lastEventEndTime = 0;

    let i = 0;
    while (i < rawEvents.length) {
        const event = rawEvents[i];
        if (event.type === 'on') {
            const blockStartTime = event.time;
            let currentBlockNotes = {};
            currentBlockNotes[event.midiNote] = event;
            const restDuration = blockStartTime - lastEventEndTime;
            if (restDuration > REST_THRESHOLD) {
                processedMelody.push({ note: null, duration: Math.round(restDuration) });
            }
            let j = i + 1;
            while (j < rawEvents.length && rawEvents[j].type === 'on' && (rawEvents[j].time - blockStartTime) < CHORD_THRESHOLD) {
                currentBlockNotes[rawEvents[j].midiNote] = rawEvents[j];
                j++;
            }
            let blockEndTime = blockStartTime;
            const notesInBlock = Object.keys(currentBlockNotes).map(Number);
            const noteOffTimes = {};
            let notesOffFoundCount = 0;
            for (let k = i; k < rawEvents.length; k++) {
                const offEvent = rawEvents[k];
                if (offEvent.type === 'off' && notesInBlock.includes(offEvent.midiNote) && !noteOffTimes[offEvent.midiNote]) {
                     noteOffTimes[offEvent.midiNote] = offEvent.time;
                     blockEndTime = Math.max(blockEndTime, offEvent.time);
                     notesOffFoundCount++;
                }
            }
            if (notesOffFoundCount < notesInBlock.length) {
                console.warn(`Block starting at ${blockStartTime.toFixed(0)}ms missing 'off' events. Using last event time.`);
                blockEndTime = Math.max(blockEndTime, rawEvents[rawEvents.length - 1].time);
            }
            const blockDuration = blockEndTime - blockStartTime;
            if (blockDuration > 20) {
                const notes = Object.values(currentBlockNotes).map(n => n.note).sort();
                processedMelody.push({
                    note: notes.length > 1 ? notes : notes[0],
                    duration: Math.round(blockDuration)
                });
                lastEventEndTime = blockEndTime;
            }
            i = j;
        } else {
            i++;
        }
    }
    return processedMelody;
}

function saveRecordingToFile(dataToSave, filename = "recorded-melody.json") {
    if (!dataToSave || dataToSave.length === 0) { alert("Nothing recorded to save!"); return; }
    try {
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Recording save prompted.");
    } catch (error) {
        console.error("Error saving file:", error);
        alert("An error occurred while trying to save the recording.");
    }
}

// ==============================================
//          UI & EVENT LISTENERS
// ==============================================

function updateMusicJsonView(melodyKey) {
    const melodyData = melodies[melodyKey];
    if (melodyData) {
        try {
             const jsonString = JSON.stringify(melodyData, null, 2);
             musicJsonDisplay.textContent = jsonString;
        } catch (e) { console.error("Error stringifying melody data:", e); musicJsonDisplay.textContent = "Error loading data."; }
    } else { musicJsonDisplay.textContent = "Select a song."; }
}

function populateSongSelect() {
    songSelect.innerHTML = '';
    Object.entries(melodies).forEach(([key, melody]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace(/([0-9]+)/g, ' $1').trim();
        songSelect.appendChild(option);
    });
}

// Updates the H3 title display based on dropdown selection
function updateCurrentSongTitle() {
    const selectedOption = songSelect.options[songSelect.selectedIndex];
    if (selectedOption && currentSongTitleDisplay) {
        currentSongTitleDisplay.textContent = selectedOption.textContent;
    } else if (currentSongTitleDisplay) {
         currentSongTitleDisplay.textContent = 'No Song Selected';
    }
}

// --- Tab Switching Logic ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTabId = button.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) { targetContent.classList.add('active'); }
        else { console.error("Cannot find tab content for ID:", targetTabId); }
    });
});

// --- Control Button Event Listeners ---
playButton.addEventListener('click', () => {
    initAudioContext();
    const selectedSongKey = songSelect.value;
    const selectedMelody = melodies[selectedSongKey];
    if (selectedMelody && !isRecording && !isPlaybackActive) { playSong(selectedMelody); }
    else if (isRecording) { console.log("Stop recording before playing."); }
    else if (isPlaybackActive) { console.log("Already playing."); }
    else { alert("Could not find selected melody."); }
});

stopButton.addEventListener('click', () => {
    if (isPlaybackActive) {
        console.log("Stop button clicked - Halting playback.");
        isPlaybackActive = false;
        stopButton.disabled = true;
        // Cleanup happens in playSong's finally block
    }
});

recordButton.addEventListener('click', () => {
     initAudioContext();
     if (!isPlaybackActive) {
         if (!isRecording) { // Start Recording
            if (midiAccess && midiAccess.inputs.size > 0) {
                isRecording = true; recordedMIDIEvents = []; recordingStartTime = performance.now();
                recordButton.textContent = "Stop Recording"; recordButton.classList.add('recording');
                recordingIndicator.style.display = 'inline';
                playButton.disabled = true; songSelect.disabled = true; speedSlider.disabled = true; stopButton.disabled = true;
                console.log("MIDI Recording Started...");
            } else { alert("No MIDI input device found."); }
         } else { // Stop Recording
            isRecording = false;
            recordButton.textContent = "Record MIDI"; recordButton.classList.remove('recording');
            recordingIndicator.style.display = 'none';
            playButton.disabled = false; songSelect.disabled = false; speedSlider.disabled = false; stopButton.disabled = true;
            console.log("MIDI Recording Stopped. Raw Events:", recordedMIDIEvents);
            const processedData = processRecording(recordedMIDIEvents);
            console.log("Processed Recording:", processedData);
            if (processedData.length > 0) { saveRecordingToFile(processedData); }
            else { alert("Recording was empty or contained no valid notes."); }
         }
     } else { console.log("Cannot record during playback."); }
});

speedSlider.addEventListener('input', (event) => {
    playbackSpeedFactor = parseFloat(event.target.value);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
});

songSelect.addEventListener('change', (event) => {
    const selectedKey = event.target.value;
    updateMusicJsonView(selectedKey);
    populateNoteScroller(melodies[selectedKey]);
    updateCurrentSongTitle(); // Update title on change
});

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(positionBlackKeys);
    }, 150);
});

// ==============================================
//          INITIAL SETUP on Load
// ==============================================

function initializeApp() {
    createKeyboard();
    populateSongSelect();
    updateCurrentSongTitle(); // Set initial title
    updateMusicJsonView(songSelect.value);
    populateNoteScroller(melodies[songSelect.value]);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
    stopButton.disabled = true; // Ensure stop is disabled
    if (liveMidiDisplay) liveMidiDisplay.textContent = '--'; // Initialize live display area
    initializeMIDI(); // Attempt MIDI connection
    console.log("Responsive Animated Piano Initialized.");
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);