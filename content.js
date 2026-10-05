// Runs on arithmetic.zetamac.com. Watches the game and saves the score when it ends.
(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;

  let inGame = false;     // currently watching a game
  let saved = false;      // already saved this game
  let maxSeconds = 0;     // largest "seconds left" seen = game duration
  let lastScore = 0;      // most recent score seen during the game

  function readScore() {
    const el = document.querySelector(".correct");
    if (!el) return null;
    const m = el.textContent.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  function readSeconds() {
    const m = document.body.innerText.match(/Seconds left:\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  async function saveGame(score) {
    const entry = { t: Date.now(), score, duration: maxSeconds };
    const { games = [] } = await api.storage.local.get("games");
    games.push(entry);
    await api.storage.local.set({ games });
    console.log("[Zetamac Tracker] saved", entry);
  }

  function tick() {
    const secs = readSeconds();
    const score = readScore();

    if (secs !== null && secs > 0) {
      // A game is in progress (or about to start).
      if (!inGame) {
        inGame = true;
        saved = false;
        maxSeconds = 0;
        lastScore = 0;
      }
      maxSeconds = Math.max(maxSeconds, secs);
      if (score !== null) lastScore = score;
    } else if (inGame && !saved) {
      // Timer hit 0 or disappeared: game over.
      const finalScore = score !== null ? score : lastScore;
      saved = true;
      inGame = false;
      saveGame(finalScore);
    }
  }

  setInterval(tick, 250);
})();
