import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// Discriminated union — exhaustive season handling
type Season = "winter" | "spring" | "summer" | "fall"

const SEASONS: readonly Season[] = ["winter", "spring", "summer", "fall"]

const SEASON_META: Readonly<Record<Season, { emoji: string; label: string }>> = {
  winter: { emoji: "❄️", label: "Winter" },
  spring: { emoji: "🌸", label: "Spring" },
  summer: { emoji: "☀️", label: "Summer" },
  fall:   { emoji: "🍂", label: "Fall" },
}

// Month ranges: Dec-Feb = winter, Mar-May = spring, Jun-Aug = summer, Sep-Nov = fall
function detectSeason(month: number): Season {
  if (month === 11 || month <= 1) return "winter"
  if (month <= 4) return "spring"
  if (month <= 7) return "summer"
  return "fall"
}

// ---------------------------------------------------------------------------
// Inline script — runs before DOM is ready, no ES module imports allowed.
// Applies the active season and marks the matching button as active.
// SPA-safe: re-runs on every nav/render event.
// ---------------------------------------------------------------------------
const inlineScript = `
(function () {
  var SEASONS = ["winter", "spring", "summer", "fall"];

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
    // Mark the active button, clear the rest
    var btns = document.querySelectorAll(".season-btn");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isActive = btn.getAttribute("data-season") === season;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (isActive) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
    document.dispatchEvent(new CustomEvent("seasonchange", { detail: { season: season } }));
  }

  function setup() {
    var saved = localStorage.getItem("season");
    var season = (saved && SEASONS.indexOf(saved) !== -1) ? saved : detectSeason();
    applySeason(season);

    var btns = document.querySelectorAll(".season-btn");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        function onClick() { applySeason(btn.getAttribute("data-season")); }
        btn.addEventListener("click", onClick);
        window.addCleanup(function () { btn.removeEventListener("click", onClick); });
      })(btns[i]);
    }
  }

  document.addEventListener("nav", setup);
  document.addEventListener("render", setup);
})();
`

const css = `
.season-toggle-group {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

.season-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  background: transparent;
  color: var(--darkgray);
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.season-btn:hover {
  opacity: 0.85;
  border-color: var(--gray);
}

.season-btn.active {
  opacity: 1;
  border-color: var(--secondary);
  color: var(--dark);
}
`

// ---------------------------------------------------------------------------
// Renders four season buttons side-by-side. The inline script marks whichever
// matches the stored/detected season as active on every page load/navigation.
// ---------------------------------------------------------------------------
const SeasonToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  const initialSeason = detectSeason(new Date().getMonth())

  return (
    <div class={["season-toggle-group", displayClass].filter(Boolean).join(" ")}>
      {SEASONS.map((season) => {
        const { emoji, label } = SEASON_META[season]
        const isActive = season === initialSeason
        return (
          <button
            key={season}
            class={["season-btn", isActive ? "active" : ""].filter(Boolean).join(" ")}
            data-season={season}
            aria-pressed={isActive ? "true" : "false"}
            aria-label={`Switch to ${label}`}
            title={label}
          >
            <span aria-hidden="true">{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

SeasonToggle.displayName = "SeasonToggle"
SeasonToggle.css = css
SeasonToggle.beforeDOMLoaded = inlineScript

export default ((): QuartzComponent => SeasonToggle) as QuartzComponentConstructor
