# Technical Context: Responsive Animated Piano Keyboard

## Technologies Used

### Core Web Technologies

1. **HTML5**
   - Semantic markup for structure
   - Data attributes for storing note information
   - Tab-based interface using `data-tab` attributes
   - Container elements for dynamic content

2. **CSS3**
   - Flexbox for responsive layouts
   - CSS animations for visual feedback
   - Media queries for responsive design
   - CSS transitions for smooth state changes
   - Custom styling for piano keys and controls

3. **JavaScript (ES6+)**
   - Arrow functions, template literals, async/await
   - DOM manipulation for dynamic content
   - Event handling for user interactions
   - Array methods for data processing
   - Promises for asynchronous operations

### Browser APIs

1. **Web Audio API**
   - `AudioContext` for audio processing
   - `OscillatorNode` for sound generation
   - `GainNode` for volume control and envelope shaping
   - Precise timing for note playback

2. **Web MIDI API**
   - `navigator.requestMIDIAccess()` for MIDI device connection
   - MIDI message parsing and handling
   - Device state change monitoring
   - Note on/off event processing

3. **File API**
   - `Blob` for creating file data
   - `URL.createObjectURL()` for generating downloadable links
   - Client-side file saving without server interaction

4. **Performance API**
   - `performance.now()` for high-resolution timing
   - Critical for accurate MIDI recording timestamps

## Development Setup

### Environment

- **Browser**: Modern web browsers (Chrome/Edge recommended for MIDI support)
- **Editor**: Any text editor or IDE with HTML/CSS/JS support
- **Server**: Simple local HTTP server for development (e.g., Live Server extension)
- **Version Control**: Git for tracking changes
- **Testing**: Manual testing in different browsers and screen sizes

### File Structure

```
project-root/
├── index.html       # Main HTML structure
├── style.css        # All styling rules
├── script.js        # Application logic
└── recorded-melody.json  # Example saved recording
```

### Development Workflow

1. **Feature Implementation**
   - Add HTML structure for new UI elements
   - Style elements with CSS
   - Implement JavaScript functionality
   - Test in multiple browsers

2. **Testing Process**
   - Manual testing of UI responsiveness
   - Audio playback verification
   - MIDI device connection testing
   - Recording and playback validation

3. **Debugging Tools**
   - Browser Developer Tools (Console, Elements, Network)
   - `console.log()` statements for tracking execution
   - Visual inspection of UI state
   - Audio verification for sound issues

## Technical Constraints

### Browser Compatibility

- **Full Support**: Chrome, Edge (latest versions)
- **Partial Support**: Firefox, Safari (may have limited MIDI capabilities)
- **Minimum Requirements**: 
  - Web Audio API support
  - ES6 JavaScript support
  - Flexbox CSS support

### Performance Considerations

- **DOM Operations**: Minimize during playback to prevent jank
- **Audio Timing**: Critical for musical accuracy
- **Memory Management**: Clean up audio nodes to prevent leaks
- **Animation Performance**: Use CSS transitions where possible
- **Event Handler Efficiency**: Debounce resize events

### Security Constraints

- **MIDI Access**: Requires user permission via browser prompt
- **Audio Context**: May require user interaction before initialization
- **Same-Origin Policy**: Affects loading external resources
- **File System Access**: Limited to downloads, no direct file system access

## Dependencies

### External Dependencies

- **None**: The application is built with vanilla web technologies only

### Internal Dependencies

1. **Data Structures**
   - `melodies` object containing predefined song data
   - `noteFrequencies` mapping note names to frequencies
   - `chordLibrary` for chord recognition

2. **Global State**
   - Audio context and nodes
   - MIDI access and device state
   - Playback and recording flags
   - DOM element references

## Tool Usage Patterns

### Audio Generation Pattern

```javascript
// Initialize audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create nodes
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// Configure nodes
oscillator.type = 'triangle';
oscillator.frequency.setValueAtTime(frequency, startTime);
gainNode.gain.setValueAtTime(0.5, startTime);
gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);

// Connect nodes
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// Schedule playback
oscillator.start(startTime);
oscillator.stop(stopTime);

// Clean up
oscillator.onended = () => {
  oscillator.disconnect();
  gainNode.disconnect();
};
```

### MIDI Handling Pattern

```javascript
// Request MIDI access
navigator.requestMIDIAccess({ sysex: false })
  .then(onMIDISuccess, onMIDIFailure);

// Process MIDI messages
function handleMIDIMessage(event) {
  const command = event.data[0] & 0xF0;
  const note = event.data[1];
  const velocity = event.data[2];
  
  // Handle note on/off
  if (command === 0x90 && velocity > 0) {
    // Note on logic
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    // Note off logic
  }
}

// Attach to inputs
function onMIDISuccess(access) {
  for (let input of access.inputs.values()) {
    input.onmidimessage = handleMIDIMessage;
  }
  access.onstatechange = handleStateChange;
}
```

### Dynamic DOM Creation Pattern

```javascript
function createElements() {
  const container = document.getElementById('container');
  container.innerHTML = ''; // Clear existing content
  
  elements.forEach(data => {
    const element = document.createElement('div');
    element.className = 'element';
    element.dataset.id = data.id;
    element.textContent = data.text;
    element.addEventListener('click', handleClick);
    container.appendChild(element);
  });
}
```

### Asynchronous Playback Pattern

```javascript
async function playSong(melody) {
  try {
    for (let i = 0; i < melody.length; i++) {
      const note = melody[i];
      // Update UI
      updateDisplay(note);
      // Play sound
      playSound(note);
      // Wait for duration
      await delay(note.duration);
    }
  } finally {
    // Cleanup regardless of completion or interruption
    resetState();
  }
}
```

### File Saving Pattern

```javascript
function saveToFile(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
