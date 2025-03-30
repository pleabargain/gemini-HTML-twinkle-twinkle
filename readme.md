# repo

https://github.com/pleabargain/gemini-HTML-twinkle-twinkle

# video
https://youtu.be/CuNrXaWe8gE

# Responsive Animated Piano Keyboard

**Now with MIDI input, recording, chord support, scrolling display, and more!**

## Description

This is an interactive web application that displays a **5-octave piano keyboard (C2-C7)** which **responds dynamically to the browser window size**. It animates the playing of selected melodies (including **chords**) like "Twinkle Twinkle Little Star", "12 Bar Blues", etc. The application visually highlights keys, plays sound using the Web Audio API, and now **integrates with connected MIDI devices** for live input and **recording**.

Users can **select different songs**, **adjust the playback speed**, view the **scrolling musical notation** (notes and basic chord names), **click notes** in the scroller to hear them, **record their own MIDI input**, and **save recordings** as JSON files. A **tabbed interface** separates the piano controls from the raw song data view.

The entire application is built using vanilla HTML, CSS, and JavaScript, requiring no external libraries or frameworks.

## Features

*   **Dynamically Generated Keyboard:** A 5-octave (C2-C7) keyboard created programmatically.
*   **Responsive Layout:** The piano adjusts its width without horizontal scrolling.
*   **Tabbed Interface:** Separate views for "Piano" and "View JSON". **(New)**
*   **Current Song Title Display:** Shows the name of the selected song. **(New)**
*   **Song Selection:** Dropdown menu for available melodies.
*   **Chord Handling:** Supports playback and recording of multiple simultaneous notes (chords). **(New)**
*   **Scrolling Note/Chord Display:** Horizontally scrolls through the selected song, highlighting and centering the current note/chord. **(New)**
*   **Basic Chord Naming:** Attempts to identify and display names for common chords (Maj, Min, 7, etc.) in the scroller. **(New)**
*   **Clickable Scroller Items:** Click notes/chords in the scroller to hear a brief preview. **(New)**
*   **Playback Speed Control:** Slider adjusts playback speed (0.25x to 2.5x).
*   **Stop Button:** Halt automated playback immediately. **(New)**
*   **Visual Animation:** Piano keys are highlighted during playback and MIDI input.
*   **Audio Playback:** Uses Web Audio API (`OscillatorNode`) for sound generation.
*   **MIDI Input Integration:** Detects connected MIDI devices (requires user permission), plays sounds, and highlights keys based on MIDI input. **(New)**
*   **MIDI Recording:** Record notes and chords played on a connected MIDI device. **(New)**
*   **Save Recording:** Save recorded performances as a structured JSON file directly from the browser (client-side saving). **(New)**
*   **View Music Data:** The "View JSON" tab displays the raw data structure for the selected song or a saved recording.
*   **Pure Vanilla JS:** Built entirely with standard HTML, CSS, and JavaScript.

## Demo

*(You could add a link to a live demo or an animated GIF here if you host it)*

To see it in action, simply open the `index.html` file in a modern web browser (Chrome/Edge recommended for full Web MIDI support).

## Technology Stack

*   **HTML:** Structures the **tabbed layout**, piano container, scrolling note display, controls (`<select>`, `<input type="range">`, `<button>`), MIDI status, and JSON view area (`<pre>`). Uses `data-note` attributes on keys and `data-tab` for navigation. **(Updated)**
*   **CSS:**
    *   Styles the piano, controls, **tabs**, and **scrolling display**. **(Updated)**
    *   Uses **Flexbox** for responsive key width and layout management.
    *   Uses `position: absolute` and JS-calculated `left`/`transform` for black keys. **(Updated)**
    *   Uses `.active` / `.current-note-item` classes for highlighting.
*   **JavaScript:** Handles all logic:
    *   **DOM Manipulation:** Creates keyboard/scroller elements, selects controls, updates text/classes, manages tab visibility. **(Updated)**
    *   **Keyboard Generation & Positioning:** Uses loops and `requestAnimationFrame` for dynamic creation and positioning based on `getBoundingClientRect`.
    *   **Tab Switching:** Handles click events on tab buttons to toggle `active` classes on content divs. **(New)**
    *   **Timing & Animation:** Uses `async/await` and a scaled `delay` function for automated playback sequencing.
    *   **Data Structures:** Represents melodies as arrays of objects (`note` can be string, array, or null; `duration`). Uses a `melodies` object map and a `keyElementMap` for DOM lookups. **(Updated)**
    *   **Web Audio API:** Initializes `AudioContext`, maps notes to frequencies, uses `OscillatorNode`/`GainNode` for sound, respects `playbackSpeedFactor`. Manages distinct sound generation for automated playback (`playNoteSound`) vs. MIDI input (`playMIDINoteSound`/`stopMIDINoteSound`). **(Updated)**
    *   **Web MIDI API:** Checks for support, requests access (`navigator.requestMIDIAccess`), lists devices, attaches `onmidimessage` listeners, parses MIDI messages (Note On/Off), handles device state changes. **(New)**
    *   **MIDI Recording & Processing:** Captures MIDI events with timestamps (`performance.now()`), processes the raw event list (`processRecording`) to group notes into chords (based on `CHORD_THRESHOLD`) and detect rests (based on `REST_THRESHOLD`), generating the standard melody data structure. **(New)**
    *   **Client-Side Saving:** Creates a JSON `Blob`, generates an object URL (`URL.createObjectURL`), and uses a temporary `<a>` element with the `download` attribute to trigger a save prompt. **(New)**
    *   **Scrolling Display Logic:** Populates the scroller with `<span>` elements (`populateNoteScroller`), including basic chord names (`getChordName`). Updates highlighting and scrolls to center the active item (`updateNoteScroller`) during playback. Handles clicks on scroller items (`playNoteItemOnClick`). **(New)**
    *   **Event Handling:** Listens for clicks (tabs, play, stop, record, scroller items), input changes (speed slider), selection changes (song dropdown), MIDI messages, and window resize. **(Updated)**
    *   **State Management:** Uses flags like `isPlaybackActive`, `isRecording`, and tracks `currentNoteItemIndex`, `activeMIDINotes`, etc. **(Updated)**

## How It Works (Approach)

1.  **HTML Structure:**
    *   A **tab navigation** (`.tab-nav`) controls visibility of content divs (`.tab-content`) within a `.tab-container`. **(New)**
    *   The "Piano" tab contains controls, MIDI status, the **scrolling note display container** (`#note-scroller-container > #note-scroller-content`), and the piano keyboard container (`#piano`). **(Updated)**
    *   The "View JSON" tab contains the `<pre>` element for displaying song data. **(New)**

2.  **JavaScript Initialization (`initializeApp`):** **(Updated)**
    *   Calls `createKeyboard()` to generate piano key elements and map them.
    *   Calls `populateSongSelect()` to fill the dropdown.
    *   Calls `updateMusicJsonView()` and `populateNoteScroller()` for the initially selected song.
    *   Sets initial speed display text.
    *   Disables the stop button.
    *   Calls `initializeMIDI()` to attempt connection.
    *   Attaches all necessary event listeners (including tab switching).

3.  **Tab Switching:** Click listeners on `.tab-button` elements toggle the `.active` class on buttons and corresponding `.tab-content` divs. **(New)**

4.  **MIDI Handling:** **(New)**
    *   `initializeMIDI` uses `navigator.requestMIDIAccess`.
    *   `onMIDISuccess` attaches `handleMIDIMessage` to detected inputs.
    *   `handleMIDIMessage` parses incoming Note On/Off messages:
        *   If recording, pushes event data with timestamp to `recordedMIDIEvents`.
        *   Triggers `playMIDINoteSound`/`stopMIDINoteSound` for live audio feedback.
        *   Adds/removes `.active` class on the corresponding piano key element.

5.  **Recording & Saving:** **(New)**
    *   Record button toggles `isRecording` state.
    *   While recording, MIDI events are stored.
    *   On stop, `processRecording` is called:
        *   Sorts raw events.
        *   Iterates through, grouping 'on' events within `CHORD_THRESHOLD` into blocks.
        *   Determines block duration by finding the latest 'off' time for notes started in that block.
        *   Detects rests based on time gaps (`REST_THRESHOLD`).
        *   Builds the `processedMelody` array (using arrays for chords).
    *   `saveRecordingToFile` converts the processed data to JSON, creates a Blob URL, and simulates a click on a download link.

6.  **Automated Playback (`playSong`):** **(Updated)**
    *   Sets `isPlaybackActive` flag, disables/enables controls appropriately (including Stop button).
    *   Calls `populateNoteScroller` first.
    *   Loops through the `melody` array:
        *   Checks `isPlaybackActive` flag to allow stopping mid-song.
        *   Calls `updateNoteScroller` to highlight/center the current item.
        *   Calls `highlightPianoKeys` for the piano display.
        *   Calls `playNoteSound` for each note in the item (handles single notes and chords).
        *   Uses scaled `delay()` for note/chord duration and inter-note gaps.
    *   Uses a `finally` block to ensure cleanup (resetting flags, controls, highlights) occurs even if stopped early.

7.  **Scrolling Display:** **(New)**
    *   `populateNoteScroller` creates `<span>` elements for each melody item, calling `getChordName` for chords/notes. It attaches click listeners here.
    *   `getChordName` performs basic interval analysis to name common chords.
    *   `updateNoteScroller` adds/removes `.current-note-item` class and uses `element.scrollTo()` with `behavior: 'smooth'` to center the active item.
    *   `playNoteItemOnClick` handles click events on scroller items, playing a short preview sound.

## Setup and Usage

1.  Save the HTML code as `index.html`.
2.  Save the CSS code as `style.css` in the same directory.
3.  Save the JavaScript code as `script.js` in the same directory.
4.  **(Optional)** Connect a MIDI keyboard or controller to your computer.
5.  Open `index.html` in a modern web browser (Chrome/Edge recommended for Web MIDI).
6.  **Grant Permission:** If using MIDI, the browser will likely ask for permission to access MIDI devices. Allow it.
7.  Check the **MIDI Status** indicator.
8.  Use the **tabs** to switch between the Piano view and the JSON view.
9.  Select a song from the dropdown - the **song title** and **scrolling display** will update.
10. (Optional) Adjust the playback speed using the slider.
11. Click notes/chords in the **scrolling display** to hear them.
12. Click **"Play"** to start automated playback; click **"Stop"** to halt it.
13. Click **"Record"** to start recording MIDI input, play on your device, and click **"Stop Recording"** when finished. You will be prompted to save the recording as a JSON file.
14. Explore the song structure in the **"View JSON"** tab.

## Potential Expansions

*   **More Songs/Load External:** Load melody data from external JSON files instead of hardcoding. Allow users to load their saved recordings.
*   **Improved Chord Detection:** Implement more sophisticated chord detection (inversions, extensions, suspensions).
*   **Visual Metronome:** Add a visual indicator for tempo during playback/recording.
*   **Improved Sound:** Implement ADSR envelopes or load real piano samples.
*   **MIDI Velocity Handling:** Use recorded/live MIDI velocity more effectively to control note volume/timbre.
*   **MIDI Control Changes:** Handle other MIDI messages like sustain pedal (CC 64), pitch bend, etc.
*   **On-Screen Keyboard Interaction:** Allow playing notes by clicking the virtual piano keys.
*   **Error Handling:** More detailed feedback for MIDI connection issues or file saving errors.
*   **Accessibility:** Improve ARIA roles and keyboard navigation.
*   **Performance Optimization:** For very long recordings or complex melodies, optimize the `processRecording` or rendering logic.