/**
 * script.js for Responsive Animated Piano
 *
 * Features:
 * - Dynamic keyboard generation (5 octaves)
 * - Responsive layout
 * - Automated song playback with speed control
 * - MIDI input display and playback
 * - MIDI recording (notes and chords) and saving
 * - Scrolling note display with chord naming
 * - Tabbed interface (Piano / View JSON)
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
const tabButtons = document.querySelectorAll('.tab-button'); // For tab navigation
const tabContents = document.querySelectorAll('.tab-content'); // For tab content

// --- Global Variables & State ---
let keys = []; // Array of piano key DOM elements
let keyElementMap = {}; // Map note names ("C4") to key DOM elements
let playbackSpeedFactor = 1.0;
let audioContext; // Web Audio API AudioContext
let midiAccess = null; // Web MIDI API access object
const activeMIDINotes = {}; // Maps MIDI note number -> { oscillator, gainNode } for stopping MIDI sounds
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
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // Note names within an octave
const noteValues = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 }; // For chord detection
const REST_THRESHOLD = 180; // ms gap to be considered a rest in recordings
const CHORD_THRESHOLD = 50; // ms max time between note-ons to be grouped as a chord

// --- Note Frequencies (C2-C7) ---
const noteFrequencies = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,'C7': 2093.00
};

// --- Melodies Data ---
const twinkleMelody = [ { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 }, { note: null, duration: 300 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 300 }, { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 } ];
const maryHadALittleLambMelody = [ { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 700 }, { note: null, duration: 100 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 }, { note: 'E4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 900 } ];
const chordsExample = [ { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: "G4", duration: 400 }, { note: "A4", duration: 400 }, { note: null, duration: 100 }, { note: ["C4", "E4", "G4"], duration: 1000 } ];
const twelveBarBluesC = [ { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["G4", "B4", "D5"], duration: 800 }, { note: null, duration: 200 }, { note: ["F4", "A4", "C5"], duration: 800 }, { note: null, duration: 200 }, { note: ["C4", "E4", "G4"], duration: 800 }, { note: null, duration: 200 }, { note: ["G4", "B4", "D5"], duration: 800 }, { note: null, duration: 200 } ];

// Master map of available melodies
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

// Plays a note for automated playback (stops itself)
function playNoteSound(noteName, durationMs) {
    if (!audioContext || !noteName || !noteFrequencies[noteName]) { return; }
    if (audioContext.state === 'suspended') { audioContext.resume(); }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[noteName];
    const durationSec = durationMs / 1000 / playbackSpeedFactor;
    const startTime = audioContext.currentTime;
    const stopTime = startTime + durationSec * 0.9; // Stop slightly early
    const fadeOutTime = Math.min(durationSec * 0.1, 0.05 / playbackSpeedFactor);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.5, startTime); // Fixed gain for playback
    gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime));
    gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);

    oscillator.start(startTime);
    oscillator.stop(stopTime);

    oscillator.onended = () => { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e){} };
}

// Plays a note from MIDI input (sustains until stopped)
function playMIDINoteSound(noteName, midiNoteNumber, velocity) {
    if (!audioContext || !noteName || !noteFrequencies[noteName]) { return; }
    if (audioContext.state === 'suspended') { audioContext.resume(); }

    stopMIDINoteSound(midiNoteNumber, true); // Prevent overlapping sounds for the *same* note

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[noteName];
    const startTime = audioContext.currentTime;
    const noteGain = Math.min(0.7, (velocity / 127) * 0.7); // Map velocity to gain

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(noteGain, startTime);
    oscillator.start(startTime);

    activeMIDINotes[midiNoteNumber] = { oscillator, gainNode, baseGain: noteGain };
}

// Stops a specific MIDI note sound
function stopMIDINoteSound(midiNoteNumber, forceStop = false) {
     if (!audioContext) return;
     if (audioContext.state === 'suspended') { audioContext.resume(); }

    const activeNote = activeMIDINotes[midiNoteNumber];
    if (activeNote) {
        const { oscillator, gainNode } = activeNote;
        const stopTime = audioContext.currentTime;
        const releaseTime = 0.1; // Short fade-out for release

        gainNode.gain.cancelScheduledValues(stopTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime); // Hold current value before ramp

        if (forceStop) { // Immediate stop, used by playMIDINoteSound
            gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + 0.01);
            oscillator.stop(stopTime + 0.02);
        } else { // Normal note-off, includes release fade
             gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + releaseTime);
             oscillator.stop(stopTime + releaseTime + 0.05);
        }
        delete activeMIDINotes[midiNoteNumber]; // Remove from tracking

        // Cleanup nodes after they stop
         oscillator.onended = () => {
            try { oscillator.disconnect(); } catch(e) {}
            try { gainNode.disconnect(); } catch(e) {}
        };
    }
}

// ==============================================
//          MIDI FUNCTIONS
// ==============================================

function midiNoteToName(midiNote) {
    if (midiNote < 0 || midiNote > 127) return null;
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1; // MIDI C0 is note 12, C4 is 60
    const noteName = notesOrder[noteIndex];
    return noteName + octave;
}

// Main handler for incoming MIDI messages
function handleMIDIMessage(event) {
    const command = event.data[0] & 0xF0; // Extract command (ignore channel)
    const midiNoteNumber = event.data[1];
    const velocity = event.data[2];
    const noteName = midiNoteToName(midiNoteNumber);

    if (!noteName) return; // Ignore if note name couldn't be determined
    const keyElement = keyElementMap[noteName]; // Find visual key element

    // --- Recording Logic ---
    if (isRecording) {
        const time = performance.now() - recordingStartTime;
        if (command === 0x90 && velocity > 0) { // Note On
            recordedMIDIEvents.push({ type: 'on', note: noteName, midiNote: midiNoteNumber, velocity: velocity, time: time });
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) { // Note Off
            recordedMIDIEvents.push({ type: 'off', note: noteName, midiNote: midiNoteNumber, time: time });
        }
    }

    // --- Live Playback/Visual Logic ---
    switch (command) {
        case 0x90: // Note On
            if (velocity > 0) {
                if (keyElement) keyElement.classList.add('active');
                initAudioContext(); // Make sure context is active
                playMIDINoteSound(noteName, midiNoteNumber, velocity);
            } else { // Note Off (velocity 0)
                if (keyElement) keyElement.classList.remove('active');
                 stopMIDINoteSound(midiNoteNumber);
            }
            break;
        case 0x80: // Note Off
            if (keyElement) keyElement.classList.remove('active');
             stopMIDINoteSound(midiNoteNumber);
            break;
    }
}

function onMIDISuccess(access) {
    console.log("MIDI Ready!");
    midiAccess = access;
    const inputs = midiAccess.inputs.values();
    let devicesFound = 0;
    let statusText = "MIDI Devices Connected: ";
    for (let input of inputs) {
        console.log(`Found MIDI input: ID=${input.id}, Name=${input.name}, Manuf=${input.manufacturer}`);
        input.onmidimessage = handleMIDIMessage; // Attach listener
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
     midiAccess.onstatechange = onMIDIStateChange; // Handle future connections/disconnections
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
             event.port.onmidimessage = handleMIDIMessage; // Attach handler
         } else if (event.port.state === 'disconnected') {
             midiStatusDisplay.textContent = `MIDI Device Disconnected: ${portName}`;
             midiStatusDisplay.className = 'status-box searching';
             event.port.onmidimessage = null; // Remove handler
             // Check if any other devices are still connected
             let stillConnected = false;
             if(midiAccess) {
                 for (let input of midiAccess.inputs.values()) {
                     if (input.state === 'connected') {
                         stillConnected = true;
                         midiStatusDisplay.textContent = `MIDI Device Connected: ${input.name || 'Unnamed'}`;
                         midiStatusDisplay.className = 'status-box connected';
                         break; // Found one, no need to check further
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
        navigator.requestMIDIAccess({ sysex: false }) // Ask for permission
            .then(onMIDISuccess, onMIDIFailure); // Handle promise outcome
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
    pianoContainer.innerHTML = ''; // Clear previous keys
    keys = [];
    keyElementMap = {};
    // Create keys for specified octave range
    for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {
        for (let i = 0; i < notesOrder.length; i++) {
            const noteName = notesOrder[i];
            const fullNoteName = noteName + octave;
            if (octave === END_OCTAVE && i > notesOrder.indexOf('B')) continue; // Don't go past B6 in the loop
            if (!noteFrequencies[fullNoteName]) continue; // Skip if frequency is missing
            const key = document.createElement('div');
            key.classList.add('key');
            key.dataset.note = fullNoteName;
            if (noteName.includes('#')) key.classList.add('black');
            else key.classList.add('white');
            pianoContainer.appendChild(key);
            keys.push(key);
            keyElementMap[fullNoteName] = key; // Store reference for quick lookup
        }
    }
    // Add final C7 key
    const finalCNote = `C${END_OCTAVE + 1}`;
    if (noteFrequencies[finalCNote]) {
        const key = document.createElement('div');
        key.classList.add('key', 'white');
        key.dataset.note = finalCNote;
        pianoContainer.appendChild(key);
        keys.push(key);
        keyElementMap[finalCNote] = key;
    }
    requestAnimationFrame(positionBlackKeys); // Position black keys after initial render
    console.log(`Keyboard created with ${keys.length} keys.`);
}

function positionBlackKeys() {
     const blackKeys = pianoContainer.querySelectorAll('.key.black');
     blackKeys.forEach(blackKey => {
        const noteName = blackKey.dataset.note;
        const noteBase = noteName.substring(0, noteName.length - 1);
        const octave = noteName.slice(-1);
        const noteIndex = notesOrder.indexOf(noteBase);
        // Determine preceding white key (e.g., C# follows C, D# follows D)
        const precedingWhiteNoteName = notesOrder[noteIndex - 1] + octave;
        const precedingWhiteKey = keyElementMap[precedingWhiteNoteName];

        if (precedingWhiteKey) {
            const whiteKeyRect = precedingWhiteKey.getBoundingClientRect();
            const pianoRect = pianoContainer.getBoundingClientRect();
            // Calculate position relative to the piano container, aiming for ~65% across the white key
            const leftPosition = whiteKeyRect.left - pianoRect.left + whiteKeyRect.width * 0.65;
            // Use transform to center the black key horizontally over this calculated point
            blackKey.style.left = `${leftPosition}px`;
            blackKey.style.transform = 'translateX(-50%)';
        }
        // else { console.warn(`Could not find preceding white key for ${noteName}`); } // Less verbose now
    });
}

function highlightPianoKeys(noteOrChord) {
    keys.forEach(key => key.classList.remove('active')); // Clear all first
    if (noteOrChord) {
        const notesToHighlight = Array.isArray(noteOrChord) ? noteOrChord : [noteOrChord];
        notesToHighlight.forEach(noteName => {
            const keyElement = keyElementMap[noteName]; // Use map for efficiency
            if (keyElement) {
                keyElement.classList.add('active');
            }
        });
    }
}

// ==============================================
//      SCROLLING DISPLAY & PLAYBACK
// ==============================================

// Basic chord name detection helper
function getChordName(notes) {
    if (!Array.isArray(notes) || notes.length < 2) {
        return Array.isArray(notes) ? notes[0] : notes; // Return single note or original value
    }
    const noteClasses = [...new Set(notes.map(n => n.replace(/[0-9]/g, '')))]; // Unique note types (C, C#, etc.)
    noteClasses.sort((a, b) => noteValues[a] - noteValues[b]); // Sort by pitch value
    const root = noteClasses[0]; // Assume lowest note is root (simplification)
    const rootVal = noteValues[root];
    const intervals = noteClasses.map(noteClass => { // Calculate intervals from root
        let val = noteValues[noteClass];
        let interval = val - rootVal;
        return interval < 0 ? interval + 12 : interval; // Handle octave wrap
    }).sort((a, b) => a - b); // Sort intervals

    let suffix = '';
    const has = (semitones) => intervals.includes(semitones); // Helper to check for interval presence

    // Basic triad and seventh patterns
    if (noteClasses.length === 3) {
        if (has(4) && has(7)) suffix = 'Maj';        // Major Triad (0, 4, 7)
        else if (has(3) && has(7)) suffix = 'Min';   // Minor Triad (0, 3, 7)
        else if (has(3) && has(6)) suffix = 'Dim';   // Diminished Triad (0, 3, 6)
        else if (has(4) && has(8)) suffix = 'Aug';   // Augmented Triad (0, 4, 8)
    } else if (noteClasses.length === 4) {
        if (has(4) && has(7) && has(10)) suffix = '7'; // Dominant 7th (0, 4, 7, 10)
        else if (has(4) && has(7) && has(11)) suffix = 'Maj7'; // Major 7th (0, 4, 7, 11)
        else if (has(3) && has(7) && has(10)) suffix = 'Min7'; // Minor 7th (0, 3, 7, 10)
        else if (has(3) && has(6) && has(10)) suffix = 'Min7b5'; // Half-Diminished (0, 3, 6, 10)
        else if (has(3) && has(6) && has(9)) suffix = 'Dim7'; // Fully Diminished 7th (0, 3, 6, 9)
    }

    return suffix ? `${root} ${suffix}` : `${root} Chord (${noteClasses.length})`; // Return name or fallback
}

// Populates the scrolling note display
function populateNoteScroller(melody) {
    noteDisplayContent.innerHTML = ''; // Clear previous
    noteScrollerSpans = [];
    currentNoteItemIndex = -1;
    if (!melody || melody.length === 0) { noteDisplayContent.textContent = "No song data."; return; }

    melody.forEach((item, index) => {
        const span = document.createElement('span');
        span.classList.add('note-item');
        span.dataset.index = index;
        if (item.note === null) {
            span.textContent = '—'; // Rest symbol
            span.classList.add('is-rest');
        } else if (Array.isArray(item.note)) {
            span.textContent = getChordName(item.note); // Use chord name function
            span.classList.add('is-chord');
        } else {
            span.textContent = item.note; // Single note name
        }
        noteDisplayContent.appendChild(span);
        noteScrollerSpans.push(span); // Keep reference
    });
    noteDisplayContainer.scrollTo({ left: 0, behavior: 'auto' }); // Go to start
}

// Highlights and scrolls the note display to the item at the given index
function updateNoteScroller(index) {
    // Remove highlight from the previous item
    if (currentNoteItemIndex >= 0 && noteScrollerSpans[currentNoteItemIndex]) {
        noteScrollerSpans[currentNoteItemIndex].classList.remove('current-note-item');
    }
    // Add highlight to the new item and scroll
    if (index >= 0 && noteScrollerSpans[index]) {
        const currentSpan = noteScrollerSpans[index];
        currentSpan.classList.add('current-note-item');
        // Calculate scroll position to center the item
        const containerWidth = noteDisplayContainer.offsetWidth;
        const spanLeft = currentSpan.offsetLeft;
        const spanWidth = currentSpan.offsetWidth;
        const desiredScrollLeft = spanLeft + spanWidth / 2 - containerWidth / 2;
        // Perform the scroll
        noteDisplayContainer.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
        currentNoteItemIndex = index; // Update the current index tracker
    } else {
        currentNoteItemIndex = -1; // Reset if index is invalid
    }
}

// Delay function respecting playback speed
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms / playbackSpeedFactor));
}

// Main function for automated song playback
async function playSong(melody) {
    if (isPlaybackActive) { console.log("Already playing."); return; } // Prevent multiple playbacks
    if (!audioContext || audioContext.state !== 'running') {
        await initAudioContext(); // Ensure audio is ready
        if (!audioContext || audioContext.state !== 'running') { alert("Audio could not be started."); return; }
    }
    populateNoteScroller(melody); // Prepare the display
    if (noteScrollerSpans.length === 0) { console.error("Cannot play: No notes loaded in scroller."); return; }

    isPlaybackActive = true; // Set flag
    // Disable controls during playback
    playButton.disabled = true;
    stopButton.disabled = false;
    songSelect.disabled = true;
    speedSlider.disabled = true;
    recordButton.disabled = true;

    const noteGap = 50; // Base gap between notes/chords

    try { // Use try...finally for guaranteed cleanup
        for (let i = 0; i < melody.length; i++) {
            if (!isPlaybackActive) break; // Check stop flag at start of loop

            const noteItem = melody[i];
            updateNoteScroller(i);          // Update display
            highlightPianoKeys(noteItem.note); // Update keyboard

            // Play sound(s) if it's not a rest
            if (noteItem.note) {
                const notesToPlay = Array.isArray(noteItem.note) ? noteItem.note : [noteItem.note];
                notesToPlay.forEach(noteName => playNoteSound(noteName, noteItem.duration));
            }

            await delay(noteItem.duration); // Wait for note/chord duration (scaled)
            if (!isPlaybackActive) break;   // Check stop flag after duration

            await delay(noteGap);           // Wait for gap (scaled)
            if (!isPlaybackActive) break;   // Check stop flag after gap
        }
    } finally {
        // This block runs regardless of how the loop exited (finished or stopped)
        console.log("Playback loop finished or stopped.");
        isPlaybackActive = false; // Reset flag

        // Cleanup UI
        keys.forEach(key => key.classList.remove('active')); // Clear keyboard highlights
        if (currentNoteItemIndex >= 0 && noteScrollerSpans[currentNoteItemIndex]) {
            noteScrollerSpans[currentNoteItemIndex].classList.remove('current-note-item'); // Clear scroller highlight
        }
        noteDisplayContainer.scrollTo({ left: 0, behavior: 'smooth' }); // Scroll back

        // Re-enable controls
        playButton.disabled = false;
        stopButton.disabled = true; // Disable stop button now
        songSelect.disabled = false;
        speedSlider.disabled = false;
        recordButton.disabled = false;
    }
}

// ==============================================
//          RECORDING & SAVING
// ==============================================

// Processes raw recorded MIDI events into the melody format
function processRecording(rawEvents) {
    if (!rawEvents || rawEvents.length === 0) return [];
    rawEvents.sort((a, b) => a.time - b.time); // Ensure chronological order

    const processedMelody = [];
    // activeNotes map is NOT needed here as we process blocks based on start times
    let lastEventEndTime = 0; // Tracks the time the *last note/chord block* finished

    let i = 0;
    while (i < rawEvents.length) {
        const event = rawEvents[i];

        if (event.type === 'on') {
            // --- Found start of a potential note/chord block ---
            const blockStartTime = event.time;
            let currentBlockNotes = {}; // Notes starting within CHORD_THRESHOLD: { midiNote: { note, time } }
            currentBlockNotes[event.midiNote] = event; // Add the first note

            // Check for rest BEFORE this block starts
            const restDuration = blockStartTime - lastEventEndTime;
            if (restDuration > REST_THRESHOLD) {
                processedMelody.push({ note: null, duration: Math.round(restDuration) });
            }

            // Group subsequent 'on' events within the CHORD_THRESHOLD
            let j = i + 1;
            while (j < rawEvents.length && rawEvents[j].type === 'on' && (rawEvents[j].time - blockStartTime) < CHORD_THRESHOLD) {
                currentBlockNotes[rawEvents[j].midiNote] = rawEvents[j];
                j++;
            }
            // 'j' now points to the first event *after* the starting note/chord block

            // --- Determine the end time of this block ---
            let blockEndTime = blockStartTime; // Earliest possible end
            const notesInBlock = Object.keys(currentBlockNotes).map(Number); // MIDI notes in this block
            const noteOffTimes = {}; // Track when each note in the block goes off
            let notesOffFoundCount = 0;

            // Search *all* subsequent events to find the 'off' time for each note started in this block
            for (let k = i; k < rawEvents.length; k++) { // Start search from the beginning of the block
                const potentialOffEvent = rawEvents[k];
                // Check if it's an 'off' event for a note that started *in this block*
                // and we haven't already recorded its 'off' time
                if (potentialOffEvent.type === 'off' && notesInBlock.includes(potentialOffEvent.midiNote) && !noteOffTimes[potentialOffEvent.midiNote]) {
                     noteOffTimes[potentialOffEvent.midiNote] = potentialOffEvent.time;
                     blockEndTime = Math.max(blockEndTime, potentialOffEvent.time); // The block ends when the LAST note finishes
                     notesOffFoundCount++;
                }
            }

            // If some notes were still 'on' at the end of the recording
            if (notesOffFoundCount < notesInBlock.length) {
                console.warn(`Block starting at ${blockStartTime.toFixed(0)}ms missing ${notesInBlock.length - notesOffFoundCount} 'off' events. Using last recorded event time.`);
                blockEndTime = Math.max(blockEndTime, rawEvents[rawEvents.length - 1].time); // Use the absolute last time
            }

            // --- Add the processed note/chord to the melody ---
            const blockDuration = blockEndTime - blockStartTime;
            if (blockDuration > 20) { // Ignore very short events (likely glitches)
                const notes = Object.values(currentBlockNotes).map(n => n.note).sort(); // Get note names and sort
                processedMelody.push({
                    note: notes.length > 1 ? notes : notes[0], // Use array for chords
                    duration: Math.round(blockDuration)
                });
                lastEventEndTime = blockEndTime; // Update the end time marker for next rest calculation
            }
            // else { console.log(`Skipping short event block at ${blockStartTime.toFixed(0)}ms`); }

            i = j; // Move main loop index past the 'on' events just processed
        } else {
            // Skip 'off' events that aren't part of starting a block
            i++;
        }
    }
    return processedMelody;
}


// Triggers client-side file download
function saveRecordingToFile(dataToSave, filename = "recorded-melody.json") {
    if (!dataToSave || dataToSave.length === 0) { alert("Nothing recorded to save!"); return; }
    try {
        const jsonString = JSON.stringify(dataToSave, null, 2); // Format JSON nicely
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob); // Create temporary URL
        const a = document.createElement("a"); // Create dummy link
        a.href = url;
        a.download = filename; // Set download attribute
        document.body.appendChild(a); // Add link to DOM
        a.click(); // Simulate click to trigger download
        document.body.removeChild(a); // Remove link
        URL.revokeObjectURL(url); // Release resource
        console.log("Recording save prompted.");
    } catch (error) {
        console.error("Error saving file:", error);
        alert("An error occurred while trying to save the recording.");
    }
}

// ==============================================
//          UI & EVENT LISTENERS
// ==============================================

// Updates the JSON display area
function updateMusicJsonView(melodyKey) {
    const melodyData = melodies[melodyKey];
    if (melodyData) {
        try {
             const jsonString = JSON.stringify(melodyData, null, 2);
             musicJsonDisplay.textContent = jsonString;
        } catch (e) {
            console.error("Error stringifying melody data:", e);
            musicJsonDisplay.textContent = "Error loading music data.";
        }
    } else {
        musicJsonDisplay.textContent = "Select a song to view its data.";
    }
}

// Populates the song selection dropdown
function populateSongSelect() {
    songSelect.innerHTML = ''; // Clear first
    Object.entries(melodies).forEach(([key, melody]) => {
        const option = document.createElement('option');
        option.value = key;
        // Create display name (e.g., "12BarBluesC" -> "12 Bar Blues C")
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replace(/([0-9]+)/g, ' $1').trim();
        songSelect.appendChild(option);
    });
}

// --- Tab Switching Logic ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTabId = button.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) {
            targetContent.classList.add('active');
        } else {
            console.error("Could not find tab content for ID:", targetTabId);
        }
    });
});

// --- Control Button Event Listeners ---
playButton.addEventListener('click', () => {
    initAudioContext();
    const selectedSongKey = songSelect.value;
    const selectedMelody = melodies[selectedSongKey];
    if (selectedMelody && !isRecording && !isPlaybackActive) {
        playSong(selectedMelody);
    } else if (isRecording) { console.log("Stop recording before playing."); }
      else if (isPlaybackActive) { console.log("Already playing."); }
      else { alert("Could not find selected melody."); }
});

stopButton.addEventListener('click', () => {
    if (isPlaybackActive) {
        console.log("Stop button clicked - Halting playback.");
        isPlaybackActive = false; // Signal playback loop to stop
        stopButton.disabled = true; // Disable stop button immediately
        // Cleanup is handled within the playSong function's finally block
    }
});

recordButton.addEventListener('click', () => {
     initAudioContext();
     if (!isPlaybackActive) { // Prevent recording during playback
         if (!isRecording) { // --- Start Recording ---
            if (midiAccess && midiAccess.inputs.size > 0) {
                isRecording = true;
                recordedMIDIEvents = [];
                recordingStartTime = performance.now();
                recordButton.textContent = "Stop Recording";
                recordButton.classList.add('recording');
                recordingIndicator.style.display = 'inline';
                // Disable other controls
                playButton.disabled = true;
                songSelect.disabled = true;
                speedSlider.disabled = true;
                stopButton.disabled = true;
                console.log("MIDI Recording Started...");
            } else {
                alert("No MIDI input device found. Connect a device and grant permission.");
            }
         } else { // --- Stop Recording ---
            isRecording = false;
            recordButton.textContent = "Record MIDI";
            recordButton.classList.remove('recording');
            recordingIndicator.style.display = 'none';
            // Re-enable controls
            playButton.disabled = false;
            songSelect.disabled = false;
            speedSlider.disabled = false;
            stopButton.disabled = true; // Stop button remains disabled unless playing

            console.log("MIDI Recording Stopped. Raw Events:", recordedMIDIEvents);
            const processedData = processRecording(recordedMIDIEvents);
            console.log("Processed Recording:", processedData);

            if (processedData.length > 0) {
                saveRecordingToFile(processedData); // Prompt user to save
            } else {
                alert("Recording was empty or contained no valid notes.");
            }
         }
     } else {
         console.log("Cannot record during playback.");
     }
});

speedSlider.addEventListener('input', (event) => {
    playbackSpeedFactor = parseFloat(event.target.value);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
});

songSelect.addEventListener('change', (event) => {
    const selectedKey = event.target.value;
    updateMusicJsonView(selectedKey);
    populateNoteScroller(melodies[selectedKey]); // Update scroller on selection change
});

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(positionBlackKeys); // Reposition black keys on resize
        // Optional: Recenter scroller if playing? Might be jerky.
        // if (isPlaybackActive && currentNoteItemIndex >= 0) updateNoteScroller(currentNoteItemIndex);
    }, 150);
});

// --- Add near other DOM Elements ---
const currentSongTitleDisplay = document.getElementById('current-song-title'); // NEW Title Element

// --- Add near other UI Update functions ---
function updateCurrentSongTitle() {
    const selectedOption = songSelect.options[songSelect.selectedIndex];
    if (selectedOption && currentSongTitleDisplay) {
        currentSongTitleDisplay.textContent = selectedOption.textContent; // Use the text from the selected option
    } else if (currentSongTitleDisplay) {
         currentSongTitleDisplay.textContent = 'No Song Selected';
    }
}

// --- Modify Event Listeners ---
songSelect.addEventListener('change', (event) => {
    const selectedKey = event.target.value;
    updateMusicJsonView(selectedKey);
    populateNoteScroller(melodies[selectedKey]);
    updateCurrentSongTitle(); // Call function to update title on change
});


// --- Modify Initial Setup ---
function initializeApp() {
    createKeyboard();
    populateSongSelect(); // Populates the dropdown
    updateCurrentSongTitle(); // Update title based on initial selection
    updateMusicJsonView(songSelect.value);
    populateNoteScroller(melodies[songSelect.value]);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
    stopButton.disabled = true;
    initializeMIDI();
    console.log("Responsive Animated Piano Initialized.");
}
// --- Add near other DOM Elements ---
// (No new elements needed)

// --- Add near other State Variables ---
// (No new state variables needed specifically for this)

// --- Sound Playback Functions ---

// Existing: playNoteSound (for automated playback)
// Existing: playMIDINoteSound (for live MIDI input)
// Existing: stopMIDINoteSound (for live MIDI input)

// NEW: Function to play a note/chord briefly on click
function playNoteItemOnClick(noteOrChord) {
    if (!noteOrChord || !audioContext) {
        if (!audioContext) console.warn("AudioContext not ready for note click.");
        return;
    } // Ignore rests (null) and if audio isn't ready

    if (audioContext.state === 'suspended') { audioContext.resume(); }

    const notesToPlay = Array.isArray(noteOrChord) ? noteOrChord : [noteOrChord];
    const clickDuration = 400; // Fixed duration for clicked notes in ms

    // Highlight piano keys briefly
    highlightPianoKeys(notesToPlay); // Add highlight
    setTimeout(() => {
        highlightPianoKeys(null); // Remove highlight after duration
    }, clickDuration);

    // Play each note in the chord/single note
    notesToPlay.forEach(noteName => {
        if (!noteFrequencies[noteName]) {
            console.warn(`Frequency not found for clicked note: ${noteName}`);
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const frequency = noteFrequencies[noteName];
        const durationSec = clickDuration / 1000; // Convert fixed duration to seconds
        const startTime = audioContext.currentTime;
        const stopTime = startTime + durationSec * 0.9; // Stop slightly early
        const fadeOutTime = 0.05; // Quick fade

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Fixed volume, quick attack/decay
        gainNode.gain.setValueAtTime(0.5, startTime); // Fixed volume
        gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime));
        gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);

        oscillator.start(startTime);
        oscillator.stop(stopTime); // Schedule stop

        oscillator.onended = () => { try { oscillator.disconnect(); gainNode.disconnect(); } catch(e){} };
    });
}


// --- Note Scroller Population (Modified) ---
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
            displayText = '—'; // Rest symbol
            span.classList.add('is-rest');
        } else if (Array.isArray(item.note)) {
            displayText = getChordName(item.note); // Use chord name function
            span.classList.add('is-chord');
        } else {
            displayText = item.note; // Single note name
        }
        span.textContent = displayText;
        noteDisplayContent.appendChild(span);
        noteScrollerSpans.push(span);

        // --- Add Click Listener ---
        if (item.note !== null) { // Only add listener to actual notes/chords
            span.addEventListener('click', () => {
                // Retrieve the note data for this specific item
                // Assumes 'melodies' and 'songSelect.value' are accessible
                const currentMelodyKey = songSelect.value;
                const currentFullMelody = melodies[currentMelodyKey];
                if (currentFullMelody && currentFullMelody[index]) {
                    const noteDataToPlay = currentFullMelody[index].note;
                     initAudioContext(); // Ensure context is ready
                    playNoteItemOnClick(noteDataToPlay); // Play the sound

                    // Optional: Add temporary visual feedback on the clicked span itself
                    span.classList.add('clicked');
                    setTimeout(() => span.classList.remove('clicked'), 200);
                } else {
                    console.error("Could not retrieve melody data for clicked item index:", index);
                }
            });
        }
        // --- End Click Listener ---

    });
    noteDisplayContainer.scrollTo({ left: 0, behavior: 'auto' });
}

// --- Rest of the script remains the same ---
// initAudioContext, playNoteSound, playMIDINoteSound, stopMIDINoteSound,
// midiNoteToName, handleMIDIMessage, onMIDISuccess, onMIDIFailure,
// onMIDIStateChange, initializeMIDI, createKeyboard, positionBlackKeys,
// delay, highlightPianoKeys, getChordName, updateNoteScroller, playSong,
// updateMusicJsonView, processRecording, saveRecordingToFile,
// populateSongSelect, Event Listeners (play, stop, record, speed, select, resize, tabs),
// initializeApp, DOMContentLoaded listener

// ==============================================
//          INITIAL SETUP on Load
// ==============================================

function initializeApp() {
    createKeyboard();
    populateSongSelect();
    updateMusicJsonView(songSelect.value);
    populateNoteScroller(melodies[songSelect.value]);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
    stopButton.disabled = true; // Ensure stop button is initially disabled
    initializeMIDI(); // Try to connect to MIDI devices
    console.log("Responsive Animated Piano Initialized.");
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);