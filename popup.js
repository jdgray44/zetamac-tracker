const api = typeof browser !== "undefined" ? browser : chrome;
const ROLLING_WINDOW = 10;

let chart = null;
let allGames = [];

const $ = (id) => document.getElementById(id);
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

function rolling(scores, n) {
  return scores.map((_, i) => avg(scores.slice(Math.max(0, i - n + 1), i + 1)));
}

function populateDurations() {
  const durations = [...new Set(allGames.map((g) => g.duration))].sort((a, b) => a - b);
  const sel = $("duration");
  const previous = sel.value;
  sel.innerHTML = "";
  durations.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d + "s games";
    sel.appendChild(opt);
  });
  if (durations.length) {
    const mostRecent = allGames[allGames.length - 1].duration;
    sel.value = durations.includes(Number(previous)) ? previous : String(mostRecent);
  }
}

function render() {
  const duration = Number($("duration").value);
  const games = allGames.filter((g) => g.duration === duration);
  const scores = games.map((g) => g.score);

  $("empty").hidden = allGames.length > 0;
  $("chart-wrap").hidden = allGames.length === 0;

  $("s-games").textContent = scores.length;
  $("s-best").textContent = scores.length ? Math.max(...scores) : "–";
  $("s-avg").textContent = scores.length ? avg(scores).toFixed(1) : "–";
  $("s-last10").textContent = scores.length ? avg(scores.slice(-10)).toFixed(1) : "–";

  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue("--accent").trim();
  const avgColor = css.getPropertyValue("--avg").trim();
  const muted = css.getPropertyValue("--muted").trim();
  const line = css.getPropertyValue("--line").trim();

  const labels = games.map((_, i) => i + 1);
  const data = {
    labels,
    datasets: [
      { label: "Score", data: scores, borderColor: accent, backgroundColor: accent,
        pointRadius: 3, borderWidth: 1.5, tension: 0.2 },
      { label: `Rolling avg (${ROLLING_WINDOW})`, data: rolling(scores, ROLLING_WINDOW),
        borderColor: avgColor, backgroundColor: avgColor, pointRadius: 0, borderWidth: 2.5, tension: 0.3 },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { labels: { color: muted, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          title: (items) => {
            const g = games[items[0].dataIndex];
            return new Date(g.t).toLocaleString();
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Game #", color: muted }, ticks: { color: muted }, grid: { color: line } },
      y: { beginAtZero: true, ticks: { color: muted }, grid: { color: line } },
    },
  };

  if (chart) chart.destroy();
  chart = new Chart($("chart"), { type: "line", data, options });
}

function exportCsv() {
  const rows = ["timestamp,date,score,duration_seconds"];
  allGames.forEach((g) => rows.push(`${g.t},${new Date(g.t).toISOString()},${g.score},${g.duration}`));
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "zetamac-scores.csv";
  a.click();
}

async function init() {
  const { games = [] } = await api.storage.local.get("games");
  allGames = games;
  populateDurations();
  render();
}

$("duration").addEventListener("change", render);
$("export").addEventListener("click", exportCsv);
$("clear").addEventListener("click", async () => {
  if (confirm("Delete all saved Zetamac scores?")) {
    await api.storage.local.set({ games: [] });
    init();
  }
});

init();
