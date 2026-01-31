import { createSystem, defaultConfig, defineConfig, defineSlotRecipe } from "@chakra-ui/react"
import { switchAnatomy } from "@chakra-ui/react/anatomy"

// Custom switch recipe to fix RTL direction issue
const switchSlotRecipe = defineSlotRecipe({
  className: "chakra-switch",
  slots: switchAnatomy.keys(),
  base: {
    root: {
      // Force LTR direction on the switch root
      direction: "ltr",
    },
  },
})

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "blue",
    },
    // Custom scrollbar styles for dark mode
    ".dark ::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    ".dark ::-webkit-scrollbar-track": {
      background: "#111827",
    },
    ".dark ::-webkit-scrollbar-thumb": {
      background: "#374151",
      borderRadius: "4px",
    },
    ".dark ::-webkit-scrollbar-thumb:hover": {
      background: "#4B5563",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "Inter, system-ui, sans-serif" },
        body: { value: "Inter, system-ui, sans-serif" },
      },
      colors: {
        // Custom brand colors matching the design (primary: #3B82F6)
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3B82F6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
          950: { value: "#172554" },
        },
        // Dark mode specific colors from design
        dark: {
          bg: { value: "#111827" },
          surface: { value: "#1F2937" },
          border: { value: "#374151" },
          borderHover: { value: "#4B5563" },
        },
      },
    },
    semanticTokens: {
      colors: {
        // Brand color semantic tokens
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "rgba(59, 130, 246, 0.1)" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "rgba(59, 130, 246, 0.1)" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "rgba(59, 130, 246, 0.2)" } },
          focusRing: { value: "{colors.brand.500}" },
        },
        // Background tokens - Dark mode: #111827 (dark-bg), #1F2937 (dark-surface)
        bg: {
          DEFAULT: { value: { _light: "#f5f7f8", _dark: "#111827" } },
          subtle: { value: { _light: "#f8fafc", _dark: "#1F2937" } },
          muted: { value: { _light: "#f1f5f9", _dark: "#374151" } },
          panel: { value: { _light: "white", _dark: "#1F2937" } },
          hover: { value: { _light: "#f1f5f9", _dark: "rgba(17, 24, 39, 0.5)" } },
        },
        // Border tokens - Dark mode: #374151 (dark-border)
        border: {
          DEFAULT: { value: { _light: "#e5e7eb", _dark: "#374151" } },
          muted: { value: { _light: "#f1f5f9", _dark: "#4B5563" } },
          hover: { value: { _light: "#d1d5db", _dark: "#4B5563" } },
        },
        // Foreground/text tokens - Dark mode: #F3F4F6 (text-main), #9CA3AF (text-muted)
        fg: {
          DEFAULT: { value: { _light: "#0d131c", _dark: "#F3F4F6" } },
          muted: { value: { _light: "#64748b", _dark: "#9CA3AF" } },
          subtle: { value: { _light: "#94a3b8", _dark: "#6B7280" } },
          inverted: { value: { _light: "white", _dark: "white" } },
        },
      },
    },
    slotRecipes: {
      switch: switchSlotRecipe,
    },
  },
})

export const system = createSystem(defaultConfig, config)
