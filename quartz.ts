import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import SeasonToggleConstructor from "./quartz/components/SeasonToggle"

// Instantiate SeasonToggle and register it so the layout system can include it.
const SeasonToggle = SeasonToggleConstructor(undefined as never)
componentRegistry.register("SeasonToggle", SeasonToggle, "local")

const config = await loadQuartzConfig()
export default config

// Build the YAML-driven layout first, then append SeasonToggle to the left slot
// on every page type. We read the base layout to preserve whatever the YAML put
// in each slot, then spread SeasonToggle in at the end.
//
// byPageType overrides are built independently from defaults, so each page type
// that overrides `left` needs its own explicit addition — they don't inherit the
// defaults.left changes automatically.
const baseLayout = await loadQuartzLayout()

function withSeasonToggle(left: unknown[]): unknown[] {
  return [...left, SeasonToggle]
}

export const layout = await loadQuartzLayout({
  defaults: {
    ...baseLayout.defaults,
    left: withSeasonToggle(baseLayout.defaults.left ?? []),
  },
  byPageType: {
    folder: {
      ...baseLayout.byPageType?.folder,
      left: withSeasonToggle(baseLayout.byPageType?.folder?.left ?? baseLayout.defaults.left ?? []),
    },
    tag: {
      ...baseLayout.byPageType?.tag,
      left: withSeasonToggle(baseLayout.byPageType?.tag?.left ?? baseLayout.defaults.left ?? []),
    },
  },
})
