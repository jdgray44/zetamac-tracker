// Runs on arithmetic.zetamac.com. Watches the game and saves the score when it ends.
(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;

  const TICK_MS = 250;
  const END_TICKS = 6; // timer must be gone/zero for 6 ticks (1.5s) in a row before we call it game over

  let inGame = false;     // currently watching a game
  let saved = false;      // already saved this game
  let maxSeconds = 0;     // largest "seconds left" seen = game duration
  let lastScore = 0;      // most recent score seen during the game
  let endTicks = 0;       // consecutive ticks with no running timer

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

  // The script may first see the timer a second or two after the game starts
  // (e.g. 118 instead of 120), so snap to the standard Zetamac game lengths.
  function snapDuration(secs) {
    const standard = [30, 60, 120, 300, 600];
    const match = standard.find((d) => d >= secs);
    return match !== undefined ? match : secs;
  }

  async function saveGame(score) {
    const entry = { t: Date.now(), score, duration: snapDuration(maxSeconds) };
    const { games = [] } = await api.storage.local.get("games");
    games.push(entry);
    await api.storage.local.set({ games });
    console.log("[Zetamac Tracker] saved", entry);
  }

  function tick() {
    const secs = readSeconds();
    const score = readScore();
    const timerRunning = secs !== null && secs > 0;

    if (timerRunning) {
      if (endTicks > 0 && inGame) {
        console.log("[Zetamac Tracker] timer blipped for", endTicks, "tick(s); ignoring");
      }
      endTicks = 0;
      if (!inGame) {
        inGame = true;
        saved = false;
        maxSeconds = 0;
        lastScore = 0;
        console.log("[Zetamac Tracker] game started");
      }
      maxSeconds = Math.max(maxSeconds, secs);
      if (score !== null) lastScore = score;
      return;
    }

    if (!inGame || saved) return;

    endTicks++;
    if (endTicks >= END_TICKS) {
      const finalScore = score !== null ? score : lastScore;
      saved = true;
      inGame = false;
      endTicks = 0;
      saveGame(finalScore);
    }
  }

  setInterval(tick, TICK_MS);
})();
