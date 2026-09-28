# A sea of little surprises

A phone-first birthday adventure built with HTML, CSS, vanilla JavaScript, and local artwork. No build step, framework, API key, or backend.

## Play

Open `index.html` directly, or run `python -m http.server 8080` in this folder and visit `http://localhost:8080`.

Tap **press to start**. Hold the right side of the ocean or **hold to swim** to move forward. Slide your finger up/down while holding to steer, or use the two arrow buttons with your other thumb. On a keyboard, hold Right Arrow or Space to swim and Up/Down to steer. Collect five pearls for each of six clues. Missed pearls are replaced; there is no timer or losing state. The final screen brings the whole day together.

Sound is optional and starts only after tapping the sound control. The game pauses when you leave the tab. Replay starts from the beginning; progress is not saved after a refresh. Decorative motion respects the device’s reduced-motion preference.

## Personalise

- Edit the `CHAPTERS` array at the top of `game.js` for all messages, times, and final itinerary summaries.
- Edit the greeting and dedication in `index.html`.
- Change colours and typography in `styles.css`.
- Lunch stays tentative and the at-home cake is not promised. The breakfast venue and dinner restaurant names are intentionally hidden.

Fonts use Google Fonts with local serif/sans-serif fallbacks. Artwork lives in `assets/`, so there are no remote image dependencies.

## GitHub Pages

Upload `index.html`, `styles.css`, `game-core.js`, `game.js`, and the `assets` folder to the root of your GitHub repository. Publish that root folder with GitHub Pages. All site paths are relative, including when the site is hosted under a repository subpath. No build command is needed.

## Check the game model

Run `node tests/game.test.cjs`. It simulates all six chapters at phone, small phone, desktop, and landscape dimensions, including pause, reset, and missed pearls. Actual phone touch testing is still recommended before gifting.

## Artwork

Original generated fan artwork created with the built-in image-generation tool. The prompts are recorded in `assets/ARTWORK.md`. This is an independent personal birthday project, not an official Studio Ghibli website.
