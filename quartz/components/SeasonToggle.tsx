import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// Season type — a discriminated union keeps season handling exhaustive
type Season = "winter" | "spring" | "summer" | "fall"

// Month ranges:  Dec-Feb = winter, Mar-May = spring, Jun-Aug = summer, Sep-Nov = fall
function detectSeason(month: number): Season {
  if (month === 11 || month <= 1) return "winter"
  if (month <= 4) return "spring"
  if (month <= 7) return "summer"
  return "fall"
}

const SEASON_META: Readonly<Record<Season, { emoji: string; label: string }>> = {
  winter: { emoji: "❄️", label: "Winter" },
  spring: { emoji: "🌸", label: "Spring" },
  summer: { emoji: "☀️", label: "Summer" },
  fall: { emoji: "🍂", label: "Fall" },
}

// ---------------------------------------------------------------------------
// Inline script — runs before DOM is ready, no ES module imports allowed.
// Sets data-season from localStorage or auto-detected calendar season.
// Wires up click handlers after nav/render events (SPA-safe).
// ---------------------------------------------------------------------------
const inlineScript = `
(function () {
  var SEASONS = ["winter", "spring", "summer", "fall"];
  var SEASON_EMOJIS = { winter: "❄️", spring: "🌸", summer: "☀️", fall: "🍂" };

  function detectSeason() {
    var m = new Date().getMonth();
    if (m === 11 || m <= 1) return "winter";
    if (m <= 4) return "spring";
    if (m <= 7) return "summer";
    return "fall";
  }

  function applySeason(season) {
    document.documentElement.setAttribute("data-season", season);
    localStorage.setItem("season", season);
    // Update all toggle button labels
    var btns = document.querySelectorAll(".season-toggle");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var emoji = btn.querySelector(".season-emoji");
      var label = btn.querySelector(".season-label");
      if (emoji) emoji.textContent = SEASON_EMOJIS[season] || "🌿";
      if (label) label.textContent = season.charAt(0).toUpperCase() + season.slice(1);
      btn.setAttribute("aria-label", "Current season: " + season + ". Click to change.");
      btn.setAttribute("data-season", season);
    }
    document.dispatchEvent(new CustomEvent("seasonchange", { detail: { season: season } }));
  }

  function cycleSeason() {
    var current = document.documentElement.getAttribute("data-season") || detectSeason();
    var idx = SEASONS.indexOf(current);
    var next = SEASONS[(idx + 1) % SEASONS.length];
    applySeason(next);
  }

  function setup() {
    // Apply saved or auto-detected season
    var saved = localStorage.getItem("season");
    var season = (saved && SEASONS.indexOf(saved) !== -1) ? saved : detectSeason();
    applySeason(season);

    // Wire up click handlers on all toggle buttons
    var btns = document.querySelectorAll(".season-toggle");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", cycleSeason);
      window.addCleanup(function (btn) {
        return function () { btn.removeEventListener("click", cycleSeason); };
      }(btns[i]));
    }
  }

  document.addEventListener("nav", setup);
  document.addEventListener("render", setup);
})();
`

// ---------------------------------------------------------------------------
// Season toggle component — renders a button that cycles through seasons.
// Server-side rendered as static HTML; the inline script wires up behaviour.
// ---------------------------------------------------------------------------
const SeasonToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  // Server-side: detect the initial season for SSR so the button isn't blank.
  // The inline script will immediately correct it in the browser anyway.
  const month = new Date().getMonth()
  const initialSeason = detectSeason(month)
  const { emoji, label } = SEASON_META[initialSeason]

  return (
    <button
      class={["season-toggle", displayClass].filter(Boolean).join(" ")}
      aria-label={`Current season: ${label}. Click to change.`}
      data-season={initialSeason}
      title="Toggle season theme"
    >
      <span class="season-emoji" aria-hidden="true">
        {emoji}
      </span>
      <span class="season-label">{label}</span>
    </button>
  )
}

SeasonToggle.displayName = "SeasonToggle"
SeasonToggle.beforeDOMLoaded = inlineScript

export default ((): QuartzComponent => SeasonToggle) as QuartzComponentConstructor
