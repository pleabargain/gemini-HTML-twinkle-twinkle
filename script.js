// --- DOM Elements ---
const noteDisplay = document.getElementById('note-display');
const playButton = document.getElementById('play-button');
const songSelect = document.getElementById('song-select');
const pianoContainer = document.getElementById('piano');
const speedSlider = document.getElementById('speed-control');
const speedDisplay = document.getElementById('speed-display');
const musicJsonDisplay = document.getElementById('music-json-display');
const midiStatusDisplay = document.getElementById('midi-status'); // Added for MIDI

// --- Global Variables & State ---
let keys = []; // Global array of key elements
let keyElementMap = {}; // Map note names to elements for quick lookup
let playbackSpeedFactor = 1.0;
let audioContext; // Initialized later
let midiAccess = null; // Added for MIDI
const activeMIDINotes = {}; // Store active oscillators keyed by MIDI note number

// --- Constants ---
const START_OCTAVE = 2;
const END_OCTAVE = 6;
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// --- Note Frequencies (C2-C7) ---
const noteFrequencies = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
    'C7': 2093.00
};

// --- Melodies ---
const twinkleMelody = [ { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 },{ note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },{ note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },{ note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 }, { note: null, duration: 300 },{ note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 },{ note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 },{ note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 },{ note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 300 },{ note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 },{ note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },{ note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },{ note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 },];
const maryHadALittleLambMelody = [ { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 },{ note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 700 }, { note: null, duration: 100 },{ note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 },{ note: 'E4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },{ note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 },{ note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },{ note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 },{ note: 'C4', duration: 900 }];
const melodies = {
    'twinkle': twinkleMelody,
    'mary': maryHadALittleLambMelody
};

// --- Web Audio API Setup ---
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Resume context if it starts suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            console.log("AudioContext created/resumed.");
        } catch (e) {
             console.error("Web Audio API is not supported in this browser", e);
             alert("Sorry, the Web Audio API is needed for sound and is not supported by your browser.");
        }
    } else if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => console.log("AudioContext resumed."));
    }
}

// Function to play sound for automated playback
function playNoteSound(note, durationMs) {
    if (!audioContext || !note || !noteFrequencies[note]) {
        if (note && !noteFrequencies[note]) console.warn(`Frequency not found for automated note: ${note}`);
        return;
    }
    if (audioContext.state === 'suspended') { audioContext.resume(); }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[note];
    // Apply speed factor to duration for automated playback
    const durationSec = durationMs / 1000 / playbackSpeedFactor;
    const startTime = audioContext.currentTime;
    const stopTime = startTime + durationSec * 0.9; // Stop slightly early based on scaled duration
    // Scale fade time as well
    const fadeOutTime = Math.min(durationSec * 0.1, 0.05 / playbackSpeedFactor);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.5, startTime); // Initial volume
    gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime)); // Hold before fade
    gainNode.gain.linearRampToValueAtTime(0.0001, stopTime); // Fade out

    oscillator.start(startTime);
    oscillator.stop(stopTime);

    oscillator.onended = () => {
        // Use try-catch as nodes might be disconnected by other means (e.g., context closed)
        try { oscillator.disconnect(); } catch(e){}
        try { gainNode.disconnect(); } catch(e){}
    };
}

// --- MIDI Note Number to Note Name Mapping ---
function midiNoteToName(midiNote) {
    if (midiNote < 0 || midiNote > 127) return null;
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = notesOrder[noteIndex];
    return noteName + octave;
}

// --- Functions to play/stop sound for MIDI input ---
function playMIDINoteSound(noteName, midiNoteNumber, velocity) {
    if (!audioContext || !noteName || !noteFrequencies[noteName]) {
        return;
    }
    if (audioContext.state === 'suspended') { audioContext.resume(); }

    stopMIDINoteSound(midiNoteNumber, true); // Force stop previous sound for this note

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[noteName];
    const startTime = audioContext.currentTime;
    const noteGain = Math.min(0.7, (velocity / 127) * 0.7); // Velocity mapping

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(noteGain, startTime); // Instant attack based on velocity

    oscillator.start(startTime);

    // Store nodes to stop them later on Note Off
    activeMIDINotes[midiNoteNumber] = { oscillator, gainNode, baseGain: noteGain };
}

function stopMIDINoteSound(midiNoteNumber, forceStop = false) {
     if (!audioContext) return;
     if (audioContext.state === 'suspended') { audioContext.resume(); }

    const activeNote = activeMIDINotes[midiNoteNumber];
    if (activeNote) {
        const { oscillator, gainNode, baseGain } = activeNote;
        const stopTime = audioContext.currentTime;
        const releaseTime = 0.1; // Release fade-out

        gainNode.gain.cancelScheduledValues(stopTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime); // Hold current gain

        if (forceStop) { // Used internally by playMIDINoteSound
            gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + 0.01);
            oscillator.stop(stopTime + 0.02);
        } else { // Standard note off
             gainNode.gain.linearRampToValueAtTime(0.0001, stopTime + releaseTime);
             oscillator.stop(stopTime + releaseTime + 0.05);
        }

        delete activeMIDINotes[midiNoteNumber]; // Clean up reference

         oscillator.onended = () => {
            try { oscillator.disconnect(); } catch(e){}
            try { gainNode.disconnect(); } catch(e){}
        };
    }
}

// --- MIDI Message Handler ---
function handleMIDIMessage(event) {
    const command = event.data[0] & 0xF0;
    const channel = event.data[0] & 0x0F;
    const midiNoteNumber = event.data[1];
    const velocity = event.data[2];
    const noteName = midiNoteToName(midiNoteNumber);

    if (!noteName) return;

    const keyElement = keyElementMap[noteName];

    switch (command) {
        case 0x90: // Note On
            if (velocity > 0) {
                if (keyElement) keyElement.classList.add('active');
                initAudioContext(); // Ensure context ready
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

// --- MIDI Initialization Functions ---
function onMIDISuccess(access) {
    console.log("MIDI Ready!");
    midiAccess = access;

    const inputs = midiAccess.inputs.values();
    let devicesFound = 0;
    let statusText = "MIDI Devices Connected: ";

    for (let input of inputs) {
        console.log(`Found MIDI input: ID=${input.id}, Name=${input.name}, Manufacturer=${input.manufacturer}`);
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
    console.log(`MIDI state changed: ID=${event.port.id}, Name=${event.port.name}, State=${event.port.state}, Type=${event.port.type}`);
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
             // Check if any others are connected
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
        console.warn("Web MIDI API is not supported in this browser.");
        midiStatusDisplay.textContent = "Web MIDI API not supported by this browser.";
        midiStatusDisplay.className = 'status-box unsupported';
    }
}

// --- Keyboard Creation & Positioning ---
function createKeyboard() {
    pianoContainer.innerHTML = '';
    keys = [];
    keyElementMap = {};

    // 1. Create and append elements
    for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {
        for (let i = 0; i < notesOrder.length; i++) {
            const noteName = notesOrder[i];
            const fullNoteName = noteName + octave;

            if (octave === END_OCTAVE && i > notesOrder.indexOf('B')) continue; // C7 handled separately
            if (!noteFrequencies[fullNoteName]) continue;

            const key = document.createElement('div');
            key.classList.add('key');
            key.dataset.note = fullNoteName;

            if (noteName.includes('#')) {
                key.classList.add('black');
            } else {
                key.classList.add('white');
            }
            pianoContainer.appendChild(key);
            keys.push(key);
            keyElementMap[fullNoteName] = key;
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

    // 2. Position black keys after render
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
            // Calculate left relative to piano container, aiming for ~65% across the white key
            const leftPosition = whiteKeyRect.left - pianoRect.left + whiteKeyRect.width * 0.65;
            // Use transform to center the black key on this calculated left edge
            blackKey.style.left = `${leftPosition}px`;
            blackKey.style.transform = 'translateX(-50%)';
        } else {
            console.warn(`Could not find preceding white key for ${noteName}`);
        }
    });
}

// --- Animation and Control Logic ---
function delay(ms) {
    // Apply speed factor only for automated playback delays
    return new Promise(resolve => setTimeout(resolve, ms / playbackSpeedFactor));
}

// Highlight function for both automated playback and MIDI
function highlightKey(note) {
    // Potentially clear *all* highlights first if MIDI might leave things highlighted?
    // keys.forEach(key => key.classList.remove('active')); // Consider if needed

    if (note) {
        const keyElement = keyElementMap[note]; // Use map
        if (keyElement) {
            keyElement.classList.add('active');
            noteDisplay.textContent = note; // Update display only for automated playback? Or MIDI too? Currently MIDI too.
        } else {
            noteDisplay.textContent = '--';
        }
    } else { // For rests in automated playback
         noteDisplay.textContent = ' ';
    }
}

// Function for automated song playback
async function playSong(melody) {
    if (!audioContext || audioContext.state !== 'running') {
         await initAudioContext();
         if (!audioContext || audioContext.state !== 'running') {
             alert("Audio could not be started. Please interact with the page (click button) and try again.");
             playButton.disabled = false; songSelect.disabled = false; speedSlider.disabled = false;
             return;
         }
    }

    playButton.disabled = true;
    songSelect.disabled = true;
    speedSlider.disabled = true;
    noteDisplay.textContent = '♪';

    const noteGap = 50; // Base gap, will be scaled by delay()

    for (const noteItem of melody) {
        // Highlight visual key
        highlightKey(noteItem.note);
        // Play sound (duration is scaled inside playNoteSound)
        playNoteSound(noteItem.note, noteItem.duration);

        // Wait scaled duration
        await delay(noteItem.duration);

        // Remove highlight before scaled gap
        const activeKey = keyElementMap[noteItem.note];
         if (activeKey) {
             activeKey.classList.remove('active');
         }

        // Wait scaled gap
        await delay(noteGap);
    }

    // Clear final highlight explicitly (sometimes MIDI might leave things highlighted)
    keys.forEach(key => key.classList.remove('active'));
    noteDisplay.textContent = '--';
    playButton.disabled = false;
    songSelect.disabled = false;
    speedSlider.disabled = false;
}

// --- JSON View ---
function updateMusicJsonView(melodyKey) {
    const melodyData = melodies[melodyKey];
    if (melodyData) {
        try {
             const jsonString = JSON.stringify(melodyData, null, 2); // Pretty print
             musicJsonDisplay.textContent = jsonString;
        } catch (e) {
            console.error("Error stringifying melody data:", e);
            musicJsonDisplay.textContent = "Error loading music data.";
        }
    } else {
        musicJsonDisplay.textContent = "Select a song to view its data.";
    }
}

// --- Event Listeners ---
playButton.addEventListener('click', () => {
    initAudioContext(); // Ensure audio context is ready
    const selectedSongKey = songSelect.value;
    const selectedMelody = melodies[selectedSongKey];
    if (selectedMelody) {
        playSong(selectedMelody);
    } else {
        alert("Could not find the selected melody.");
    }
});

speedSlider.addEventListener('input', (event) => {
    playbackSpeedFactor = parseFloat(event.target.value);
    speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`;
});

songSelect.addEventListener('change', (event) => {
    updateMusicJsonView(event.target.value);
});

// Re-calculate black key positions on window resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(positionBlackKeys);
    }, 150); // Debounce delay
});

// --- Initial Setup ---
createKeyboard(); // Create keys
updateMusicJsonView(songSelect.value); // Display JSON for default song
noteDisplay.textContent = '--'; // Initial display text
speedDisplay.textContent = `${playbackSpeedFactor.toFixed(2)}x`; // Initial speed display
initializeMIDI(); // Attempt to initialize MIDI

console.log("Responsive Animated Piano script loaded.");