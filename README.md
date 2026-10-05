# Zetamac Tracker

A small Firefox extension that automatically logs your scores from
[arithmetic.zetamac.com](https://arithmetic.zetamac.com) and graphs your progress over time.

- Saves each game's score, date and duration to `browser.storage.local` (no server, no account)
- Popup with a score-per-game chart, a 10-game rolling average, best / average / last-10 stats
- Filter by game duration, export to CSV

## Install (temporary, for development)
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...** and select `manifest.json`
3. Play a game, then click the extension icon (puzzle-piece menu if it isn't pinned)

Temporary add-ons are removed when Firefox restarts. For a permanent install, use Firefox
Developer Edition or have the extension signed through addons.mozilla.org.

## Files
- `manifest.json` extension config
- `content.js` detects the end of a game and saves the score
- `popup.html / popup.css / popup.js` the graph and stats
- `chart.umd.js` bundled Chart.js (MIT)
