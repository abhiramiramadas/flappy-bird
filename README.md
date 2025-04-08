# Flappy Bird Enhanced

A modern remake of the classic *Flappy Bird* game with enhanced features, improved visuals, and power-ups. Built using HTML5, CSS, and JavaScript, this version introduces a fresh take on the iconic game with customizable themes, responsive design, and immersive audio effects.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Controls](#controls)
- [Power-Ups](#power-ups)
- [Themes](#themes)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

*Flappy Bird Enhanced* brings the nostalgic gameplay of *Flappy Bird* into the modern era with a sleek UI, power-ups, and additional customization options. Navigate the bird through a series of pipes by flapping its wings, collect power-ups to gain advantages, and aim for a new high score!

This project is fully responsive, supports multiple input methods (keyboard, mouse, and touch), and includes audio effects for an engaging experience.

## Features

- **Classic Gameplay**: Retains the core mechanics of *Flappy Bird* with smooth controls and challenging pipe navigation.
- **Power-Ups**: Collect power-ups like invincibility, slow motion, and double points during gameplay.
- **Customizable Themes**: Switch between Day, Night, and Retro modes for different visual experiences.
- **Responsive Design**: Adapts to various screen sizes, including mobile devices.
- **Audio Effects**: Includes sound effects for flapping, scoring, power-ups, and game over, plus background music.
- **Score System**: Tracks current score and high score, saved locally via `localStorage`.
- **Settings Panel**: Toggle music, sound effects, and themes on the fly.
- **Pause Functionality**: Pause and resume the game with the Escape key or when switching tabs.
- ** bedFeature**: Share your score via the Web Share API (where supported).

## Installation

1. **Clone or Download**:
   - Clone this repository: `git clone <repository-url>`
   - Or download the ZIP file and extract it.
2. **Open Locally**:
   - Navigate to the project folder.
   - Open `index.html` in a web browser (e.g., Chrome, Firefox).
3. **Optional - Local Server**:
   - For a better experience (to avoid CORS issues with audio files), use a local server:
     - With Node.js: Install `http-server` (`npm install -g http-server`), then run `http-server` in the project directory.
     - With Python: Run `python -m http.server` (Python 3) and visit `http://localhost:8000`.

No additional dependencies are required as the game runs entirely in the browser.

## Usage

1. Open the game in your browser.
2. Click "Start Game" or press the Spacebar to begin.
3. Flap the bird’s wings to navigate through pipes and collect power-ups.
4. Use the settings panel (gear icon) to adjust music, sound, or theme preferences.
5. When the game ends, choose to restart or share your score.

## Controls

- **Flap**:
  - Keyboard: `Spacebar` or `↑` (Up Arrow)
  - Mouse: Left-click on the canvas
  - Touch: Tap the screen (mobile)
- **Pause**: `Escape` key
- **Start**: `Spacebar` or click "Start Game" button
- **Resume/Quit**: Use buttons on the pause screen

## Power-Ups

Power-ups spawn randomly between pipes with a 10% chance. Collect them by flying into them:

- **Invincibility (🛡️)**: Prevents collisions with pipes for 5 seconds.
- **Slow Motion (🐌)**: Reduces pipe speed by half for 5 seconds.
- **Double Points (✖️2)**: Doubles the points earned per pipe for 10 seconds.

## Themes

Change the game’s appearance via the settings menu:

- **Day Mode**: Bright sky with clouds and a light ground.
- **Night Mode**: Dark sky with stars and a muted ground.
- **Retro Mode**: Grayscale aesthetic inspired by old-school games.


**Note**: Audio files are sourced from external URLs (Mixkit) in the provided code. For offline use, download these files and update the paths in `index.html`.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m "Add feature"`).
4. Push to your fork (`git push origin feature-branch`).
5. Open a pull request.

Suggestions for enhancements:
- New power-ups or themes.
- Additional sound effects or music tracks.
- Improved animations or graphics.

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as needed.

---

Enjoy playing *Flappy Bird Enhanced*! Can you beat your high score?
