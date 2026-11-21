import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import SeasonToggleConstructor from "./quartz/components/SeasonToggle"

// Instantiate SeasonToggle and register it so the layout system can include it.
// QuartzComponentConstructor<undefined> requires opts: undefined — pass it explicitly.
const SeasonToggle = SeasonToggleConstructor(undefined as never)
componentRegistry.register("SeasonToggle", SeasonToggle, "local")

const config = await loadQuartzConfig()
export default config

// Inject SeasonToggle into the left toolbar slot alongside reader-mode and search.
// This runs after loadQuartzConfig() so the YAML-driven layout is already built;
// passing overrides here merges with it rather than replacing it.
export const layout = await loadQuartzLayout({
  defaults: {
    left: [SeasonToggle],
  },
})
