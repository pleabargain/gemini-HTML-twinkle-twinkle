# System Patterns: Responsive Animated Piano Keyboard

## System Architecture

The Responsive Animated Piano Keyboard follows a modular, component-based architecture organized around core functionalities. The system is built entirely with vanilla web technologies (HTML, CSS, JavaScript) and follows a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Piano View  │  │ JSON View   │  │ Controls Panel  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                           │                             │
│  ┌─────────────┐  ┌───────▼───────┐  ┌───────────────┐  │
│  │ Audio       │  │ Core          │  │ MIDI          │  │
│  │ Engine      │◄─┤ Application   ├──► Controller    │  │
│  └─────────────┘  └───────┬───────┘  └───────────────┘  │
│                           │                             │
│  ┌─────────────┐  ┌───────▼───────┐  ┌───────────────┐  │
│  │ Melody      │  │ Keyboard      │  │ Recording     │  │
│  │ Processor   │◄─┤ Controller    ├──► Engine        │  │
│  └─────────────┘  └───────────────┘  └───────────────┘  │
│                                                         │
│                  Application Logic                      │
└─────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

1. **Pure Vanilla Implementation**
   - **Decision**: Use only native HTML, CSS, and JavaScript without external libraries
   - **Rationale**: Minimize dependencies, ensure long-term maintainability, demonstrate core web capabilities
   - **Impact**: Requires custom implementations for features that might be available in libraries, but results in smaller bundle size and no dependency management

2. **Web Audio API for Sound Generation**
   - **Decision**: Use the Web Audio API with OscillatorNode for sound synthesis
   - **Rationale**: Native browser support, low latency, fine-grained control over audio parameters
   - **Impact**: Enables precise timing and control of audio playback, though limited to synthesized sounds rather than sampled instruments

3. **Web MIDI API for Device Integration**
   - **Decision**: Implement Web MIDI API for hardware keyboard connectivity
   - **Rationale**: Enables direct connection to physical MIDI devices without plugins
   - **Impact**: Provides professional-grade input capabilities but requires browser support and user permission

4. **Dynamic DOM Generation**
   - **Decision**: Generate piano keys and note display elements programmatically
   - **Rationale**: Allows for flexible, responsive layouts and easier maintenance
   - **Impact**: Reduces HTML boilerplate but requires careful performance optimization for DOM operations

5. **Client-Side Recording and Saving**
   - **Decision**: Implement recording and file saving entirely on the client side
   - **Rationale**: Eliminates server dependencies, respects user privacy, works offline
   - **Impact**: Limited by browser storage capabilities but provides immediate feedback and control to users

## Design Patterns in Use

1. **Module Pattern**
   - **Implementation**: Logical grouping of related functions (Audio Functions, MIDI Functions, etc.)
   - **Purpose**: Organize code into cohesive units with clear responsibilities
   - **Example**: The audio functions module encapsulates all sound generation logic

2. **Observer Pattern**
   - **Implementation**: Event listeners for user interactions and MIDI events
   - **Purpose**: Decouple event sources from event handlers
   - **Example**: MIDI input events trigger updates across multiple components (keyboard highlighting, sound generation, recording)

3. **Factory Pattern**
   - **Implementation**: Functions that create and return DOM elements
   - **Purpose**: Standardize the creation of similar objects
   - **Example**: `createKeyboard()` generates all piano key elements with consistent properties

4. **State Machine**
   - **Implementation**: Flags and state variables that control application behavior
   - **Purpose**: Manage complex state transitions and prevent invalid states
   - **Example**: `isPlaybackActive`, `isRecording` flags control UI state and prevent conflicting operations

5. **Command Pattern**
   - **Implementation**: Functions that encapsulate all information needed to perform an action
   - **Purpose**: Parameterize and queue operations
   - **Example**: The melody data structure represents a sequence of commands (play this note for this duration)

## Component Relationships

1. **Piano Keyboard ↔ Audio Engine**
   - The piano keyboard visual component triggers sound generation in the audio engine
   - The audio engine's playback state affects visual highlighting on the keyboard

2. **MIDI Controller → Piano Keyboard**
   - MIDI input events are translated to keyboard highlighting and audio playback
   - The keyboard serves as a visual representation of MIDI input

3. **Melody Processor → Piano Keyboard + Audio Engine**
   - The melody processor coordinates the playback of predefined or recorded melodies
   - It synchronizes visual highlighting with audio playback

4. **Recording Engine → Melody Processor**
   - The recording engine captures MIDI input and processes it into the melody data format
   - Recorded melodies can be played back through the melody processor

5. **UI Controls → All Components**
   - UI controls affect the behavior of all other components
   - They provide a centralized way to manage application state

## Critical Implementation Paths

1. **Keyboard Rendering Pipeline**
   ```
   createKeyboard() → generate DOM elements → positionBlackKeys() → responsive layout
   ```
   - Critical for visual representation and user interaction
   - Must maintain correct key positioning across screen sizes

2. **Audio Playback Chain**
   ```
   playNoteSound() → AudioContext → OscillatorNode → GainNode → audio output
   ```
   - Critical for core functionality of sound generation
   - Must maintain low latency and accurate timing

3. **MIDI Processing Flow**
   ```
   MIDI input → handleMIDIMessage() → note processing → visual + audio feedback
   ```
   - Critical for hardware integration
   - Must handle various MIDI devices and message types

4. **Recording and Processing Path**
   ```
   MIDI events → raw event capture → processRecording() → structured melody data → save
   ```
   - Critical for preserving user performances
   - Must accurately represent timing and chord relationships

5. **Playback Synchronization Path**
   ```
   playSong() → updateNoteScroller() → highlightPianoKeys() → playNoteSound() → delay()
   ```
   - Critical for educational value and user experience
   - Must maintain synchronization between visual and audio elements
