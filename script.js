// --- DOM Elements ---
const noteDisplay = document.getElementById('note-display');
const playButton = document.getElementById('play-button');
const songSelect = document.getElementById('song-select');
const pianoContainer = document.getElementById('piano');
let keys = []; // Will be populated after keyboard creation

// --- Constants ---
const START_OCTAVE = 2;
const END_OCTAVE = 6; // Creates keys up to B6 (5 full octaves C2-C6)
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEY_WIDTH = 35; // Must match CSS .white width
const BLACK_KEY_WIDTH = 22; // Must match CSS .black width
const BLACK_KEY_OFFSET_FACTOR = 0.68; // Adjust for black key positioning relative to white key start

// --- Note Frequencies (Expanded C2-C7) ---
const noteFrequencies = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
    'C7': 2093.00 // Include C7 for range completion if needed
};

// --- Melodies ---
const twinkleMelody = [
    { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 },
    { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },
    { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },
    { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 }, { note: null, duration: 300 },
    { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 },
    { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 },
    { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 },
    { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 300 },
    { note: 'C4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 400 },
    { note: 'A4', duration: 400 }, { note: 'A4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },
    { note: 'F4', duration: 400 }, { note: 'F4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },
    { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 700 },
];

const maryHadALittleLambMelody = [
    { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 },
    { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 700 }, { note: null, duration: 100 },
    { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'D4', duration: 700 }, { note: null, duration: 100 },
    { note: 'E4', duration: 400 }, { note: 'G4', duration: 400 }, { note: 'G4', duration: 700 }, { note: null, duration: 100 },
    { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'C4', duration: 400 }, { note: 'D4', duration: 400 },
    { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'E4', duration: 400 },
    { note: 'D4', duration: 400 }, { note: 'D4', duration: 400 }, { note: 'E4', duration: 400 }, { note: 'D4', duration: 400 },
    { note: 'C4', duration: 900 }
];

// Map song select values to melody data
const melodies = {
    'twinkle': twinkleMelody,
    'mary': maryHadALittleLambMelody,
};

// --- Web Audio API Setup ---
let audioContext;

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
             // Resume context if it starts suspended (common in Chrome)
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

function playNoteSound(note, durationMs) {
    if (!audioContext || !note || !noteFrequencies[note]) {
        if (note && !noteFrequencies[note]) console.warn(`Frequency not found for note: ${note}`);
        return;
    }
    if (audioContext.state === 'suspended') { // Double check before playing
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const frequency = noteFrequencies[note];
    const durationSec = durationMs / 1000;
    const startTime = audioContext.currentTime;
    const stopTime = startTime + durationSec * 0.9; // Stop slightly early
    const fadeOutTime = 0.05;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.5, startTime); // Initial volume
    gainNode.gain.setValueAtTime(0.5, Math.max(startTime, stopTime - fadeOutTime)); // Ensure gain is up before fade if duration is very short
    gainNode.gain.linearRampToValueAtTime(0.0001, stopTime); // Fade out

    oscillator.start(startTime);
    oscillator.stop(stopTime);

    oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
    };
}

// --- Keyboard Creation ---
function createKeyboard() {
    pianoContainer.innerHTML = ''; // Clear existing keys
    let whiteKeyIndex = 0;
    const keyElements = []; // Temporary store to push to global 'keys' later

    for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {
        for (let i = 0; i < notesOrder.length; i++) {
            const noteName = notesOrder[i];
            const fullNoteName = noteName + octave;

            // Stop if we exceed the defined end octave (e.g., don't create C7 if END_OCTAVE is 6)
            if (octave === END_OCTAVE && noteName === 'C' && octave > START_OCTAVE) {
                 // Special case: Include C of the *next* octave if it's the end
                 if (notesOrder[i] !== 'C') continue; // Only allow C if it's the end note
            } else if (octave > END_OCTAVE) {
                 continue;
            }
             // Ensure note frequency exists before creating key
             if (!noteFrequencies[fullNoteName]) {
                 console.warn(`Skipping key creation for ${fullNoteName} - frequency not defined.`);
                 continue;
             }


            const key = document.createElement('div');
            key.classList.add('key');
            key.dataset.note = fullNoteName;

            if (noteName.includes('#')) {
                // Black Key
                key.classList.add('black');
                // Calculate position based on the *previous* white key's index
                const leftPosition = (whiteKeyIndex -1) * WHITE_KEY_WIDTH + (WHITE_KEY_WIDTH * BLACK_KEY_OFFSET_FACTOR);
                key.style.left = `${leftPosition}px`;
            } else {
                // White Key
                key.classList.add('white');
                whiteKeyIndex++; // Increment only for white keys
            }
            pianoContainer.appendChild(key);
            keyElements.push(key); // Add to temporary array
        }
    }
     // Final C key for the last specified octave
    const finalCNote = `C${END_OCTAVE + 1}`;
    if (noteFrequencies[finalCNote]) {
        const key = document.createElement('div');
        key.classList.add('key', 'white');
        key.dataset.note = finalCNote;
        pianoContainer.appendChild(key);
        keyElements.push(key);
    }


    keys = keyElements; // Update the global 'keys' array
    console.log(`Keyboard created with ${keys.length} keys.`);
}


// --- Animation and Control Logic ---
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightKey(note) {
    // Use the globally updated 'keys' array
    keys.forEach(key => key.classList.remove('active'));

    if (note) {
        // Find key using querySelector on the container for efficiency
        const keyElement = pianoContainer.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
            noteDisplay.textContent = note;
        } else {
            console.warn(`Key element not found for note: ${note}`);
            noteDisplay.textContent = '--';
        }
    } else {
         noteDisplay.textContent = ' '; // Show space for rests
    }
}

async function playSong(melody) {
    // Ensure AudioContext is running before starting playback
    if (!audioContext || audioContext.state !== 'running') {
        console.log("AudioContext not running, attempting to resume...");
        await initAudioContext(); // Attempt to start/resume it
        if (!audioContext || audioContext.state !== 'running') {
             alert("Audio could not be started. Please interact with the page (click button) and try again.");
             playButton.disabled = false;
             return; // Exit if audio is still not ready
        }
    }

    playButton.disabled = true;
    songSelect.disabled = true; // Disable dropdown during playback
    noteDisplay.textContent = '♪';

    const noteGap = 50;

    for (const noteItem of melody) {
        playNoteSound(noteItem.note, noteItem.duration);
        highlightKey(noteItem.note);

        await delay(noteItem.duration);

        // Remove highlight before the gap
         // Find key again in case DOM changed - though unlikely here
         const activeKey = pianoContainer.querySelector(`.key[data-note="${noteItem.note}"]`);
         if (activeKey) {
             activeKey.classList.remove('active');
         }

        await delay(noteGap);
    }

    keys.forEach(key => key.classList.remove('active')); // Clear final highlight
    noteDisplay.textContent = '--';
    playButton.disabled = false;
    songSelect.disabled = false; // Re-enable dropdown
}

// --- Event Listeners and Initialization ---
playButton.addEventListener('click', () => {
    initAudioContext(); // Ensure audio context is ready on user interaction

    const selectedSongKey = songSelect.value;
    const selectedMelody = melodies[selectedSongKey];

    if (selectedMelody) {
        playSong(selectedMelody);
    } else {
        console.error(`Melody not found for key: ${selectedSongKey}`);
        alert("Could not find the selected melody.");
    }
});

// Create the keyboard when the script loads
createKeyboard();

// Initial state
noteDisplay.textContent = '--';