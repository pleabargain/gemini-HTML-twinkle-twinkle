# Project Brief: Responsive Animated Piano Keyboard

## Project Overview
The Responsive Animated Piano Keyboard is an interactive web application that displays a 5-octave piano keyboard (C2-C7) which responds dynamically to the browser window size. It provides a visual and auditory experience for playing and learning music, with support for MIDI input, recording, chord recognition, and a scrolling musical notation display.

## Core Requirements

1. **Interactive Piano Interface**
   - Display a responsive 5-octave piano keyboard (C2-C7)
   - Dynamically adjust to browser window size
   - Visually highlight keys during playback and input

2. **Audio Capabilities**
   - Generate sound using Web Audio API
   - Support for single notes and chords
   - Adjustable playback speed

3. **MIDI Integration**
   - Detect and connect to MIDI devices
   - Process MIDI input for live playback
   - Record MIDI performances
   - Save recordings as structured JSON files

4. **Visual Feedback**
   - Scrolling musical notation display
   - Basic chord naming and recognition
   - Tabbed interface for different views
   - Current song title display

5. **User Controls**
   - Song selection from predefined melodies
   - Playback speed adjustment
   - Play/Stop controls
   - Recording functionality

## Technical Constraints

1. **Pure Web Technologies**
   - HTML5 for structure
   - CSS3 for styling and responsive design
   - Vanilla JavaScript (no external libraries or frameworks)

2. **Browser Compatibility**
   - Modern browsers (Chrome/Edge recommended for full Web MIDI support)
   - Graceful degradation for browsers without MIDI support

3. **Performance**
   - Smooth animations and transitions
   - Efficient audio generation
   - Responsive UI even on lower-end devices

## Project Goals

1. **Educational Value**
   - Help users visualize music theory concepts
   - Provide an interactive way to learn melodies and chord progressions

2. **Accessibility**
   - Make music creation accessible to users without physical instruments
   - Provide visual feedback for audio elements

3. **Extensibility**
   - Design the system to allow for future enhancements
   - Structure code to support additional features like more songs, improved sound, etc.

4. **User Experience**
   - Create an intuitive, responsive interface
   - Ensure smooth performance across different devices and screen sizes
   - Provide clear visual and audio feedback

## Success Criteria

1. The piano keyboard renders correctly and responsively across different screen sizes
2. Audio playback is accurate and synchronized with visual highlighting
3. MIDI devices can be connected and used for input
4. Recordings can be created and saved successfully
5. The interface is intuitive and user-friendly
6. The application runs smoothly without performance issues
