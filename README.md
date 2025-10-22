# Timer App

A frontend-only countdown timer with presets tailored for workshops and tablet displays. Built to be deployed via GitHub Pages.

## Features
- Preset durations: 30 seconds, 1, 2, 3, and 5 minutes.
- Large, high-contrast countdown readout optimized for tablets.
- Touch-friendly controls that simplify to a single Stop button while running.
- Multi-tone alarm on completion using the Web Audio API.
- Ready for static hosting; currently deployed on GitHub Pages.

## Usage
Open [`index.html`](index.html) in any modern browser. The GitHub Pages deployment is available at <https://tamaroh.github.io/timerapp/>.

## Deployment
The site is served directly from the `main` branch root via GitHub Pages. Pushes to `main` trigger the automatic redeploy. To redeploy manually:
```sh
git add .
git commit -m "Your message"
git push
```

## Prompt & Response Log
A condensed history of your requests and the matching updates:

1. **Prompt:** "create frontend-only timer app. we want to set 30sec, 1min, 2min, 3min, 5min. want to have alarm when finished."  
   **Actions:** Generated initial HTML/CSS/JS, implemented presets, countdown logic, and an alarm tone.
2. **Prompt:** "wanto to visualize more big and clear. i want to use tablets to open this, and use in some onsight workshop."  
   **Actions:** Enlarged layout, typography, and button spacing for tablet legibility.
3. **Prompt:** "display time more bigger, and the buttons more smaller."  
   **Actions:** Amplified timer font size and reduced button footprint while keeping touch targets usable.
4. **Prompt:** "I want to publish to github pages. this local repository is already synced via gh command. please deploy this."  
   **Actions:** Enabled GitHub Pages for the repo via `gh` API calls and confirmed build initiation.
5. **Prompt:** "hide buttons when timer is running"  
   **Actions:** (Later reverted by you) Added state toggles to hide controls mid-countdown.
6. **Prompt:** "It was not good so I did git restore. hide the button except stop button when the timer is running."  
   **Actions:** Reworked UI state to keep only the Stop button visible during active timers.
7. **Prompt:** "make sound when time is up"  
   **Actions:** Ensured the audio context is user-gesture activated and upgraded the completion alarm.
8. **Prompt:** "git push"  
   **Actions:** Committed changes and pushed to `main` for redeployment.
9. **Prompt:** "create readme.md and write down what you did, including my prompts."  
   **Actions:** You are reading the result.

## Local Development
No build tooling required—open the HTML file directly. For changes, ensure audio still triggers (browsers need a user interaction) and test on tablet dimensions.

## License
Not specified. Add a license file if needed for distribution.
