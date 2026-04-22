/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface AdminColorScheme {
  id: string
  name: string
  /** 4 preview swatch colors */
  swatches: [string, string, string, string]
  /** sidebar bg */
  sidebarBg: string
  /** sidebar text */
  sidebarText: string
  /** sidebar text muted */
  sidebarTextMuted: string
  /** sidebar active item bg */
  sidebarActiveBg: string
  /** sidebar active item text */
  sidebarActiveText: string
  /** sidebar hover bg */
  sidebarHoverBg: string
  /** top accent bar color */
  accent: string
  /** accent hover */
  accentHover: string
}

export const COLOR_SCHEMES: AdminColorScheme[] = [
  {
    id: "default",
    name: "Padrão",
    swatches: ["#1e1e1e", "#23282d", "#0073aa", "#00a0d2"],
    sidebarBg: "#23282d",
    sidebarText: "#c3c4c7",
    sidebarTextMuted: "#a7aaad",
    sidebarActiveBg: "#0073aa",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#2c3338",
    accent: "#0073aa",
    accentHover: "#006799",
  },
  {
    id: "light",
    name: "Claro",
    swatches: ["#e5e5e5", "#999999", "#d64e07", "#04a4cc"],
    sidebarBg: "#f1f1f1",
    sidebarText: "#555555",
    sidebarTextMuted: "#888888",
    sidebarActiveBg: "#ffffff",
    sidebarActiveText: "#d64e07",
    sidebarHoverBg: "#e8e8e8",
    accent: "#d64e07",
    accentHover: "#c44607",
  },
  {
    id: "blue",
    name: "Azul",
    swatches: ["#096484", "#4796b3", "#52accc", "#74B6CE"],
    sidebarBg: "#096484",
    sidebarText: "#CAE9F2",
    sidebarTextMuted: "#9ebcc5",
    sidebarActiveBg: "#4796b3",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#0b7ca4",
    accent: "#e1a948",
    accentHover: "#c99a3a",
  },
  {
    id: "coffee",
    name: "Café",
    swatches: ["#46403c", "#59524c", "#c7a589", "#9ea476"],
    sidebarBg: "#46403c",
    sidebarText: "#cdc4bc",
    sidebarTextMuted: "#a89e94",
    sidebarActiveBg: "#59524c",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#534c46",
    accent: "#c7a589",
    accentHover: "#b89778",
  },
  {
    id: "ectoplasm",
    name: "Ectoplasma",
    swatches: ["#413256", "#523f6d", "#a3b745", "#d46f15"],
    sidebarBg: "#413256",
    sidebarText: "#c6b9d4",
    sidebarTextMuted: "#a593b8",
    sidebarActiveBg: "#523f6d",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#4c3a65",
    accent: "#a3b745",
    accentHover: "#929e3e",
  },
  {
    id: "midnight",
    name: "Meia-noite",
    swatches: ["#25282b", "#363b3f", "#69a8bb", "#e14d43"],
    sidebarBg: "#25282b",
    sidebarText: "#c3c4c7",
    sidebarTextMuted: "#8c8f94",
    sidebarActiveBg: "#363b3f",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#2e3235",
    accent: "#e14d43",
    accentHover: "#c94239",
  },
  {
    id: "ocean",
    name: "Oceano",
    swatches: ["#627c83", "#738e96", "#9ebaa0", "#aa9d88"],
    sidebarBg: "#627c83",
    sidebarText: "#d5e2e5",
    sidebarTextMuted: "#a5b7bc",
    sidebarActiveBg: "#738e96",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#6d8a91",
    accent: "#9ebaa0",
    accentHover: "#8ba98e",
  },
  {
    id: "sunrise",
    name: "Nascer do Sol",
    swatches: ["#b43c38", "#cf4944", "#dd823b", "#ccaf0b"],
    sidebarBg: "#b43c38",
    sidebarText: "#f1c8c7",
    sidebarTextMuted: "#d4a9a7",
    sidebarActiveBg: "#cf4944",
    sidebarActiveText: "#ffffff",
    sidebarHoverBg: "#c0413d",
    accent: "#dd823b",
    accentHover: "#c77535",
  },
]

interface AdminThemeContextType {
  scheme: AdminColorScheme
  setSchemeId: (id: string) => void
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  scheme: COLOR_SCHEMES[0],
  setSchemeId: () => {},
})

export function useAdminTheme() {
  return useContext(AdminThemeContext)
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [schemeId, setSchemeIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "default"
    return localStorage.getItem("k2k-admin-scheme") || "default"
  })

  const scheme = COLOR_SCHEMES.find((s) => s.id === schemeId) || COLOR_SCHEMES[0]

  const setSchemeId = (id: string) => {
    setSchemeIdState(id)
    localStorage.setItem("k2k-admin-scheme", id)
  }

  // Apply CSS variables to document for admin pages
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--admin-sidebar-bg", scheme.sidebarBg)
    root.style.setProperty("--admin-sidebar-text", scheme.sidebarText)
    root.style.setProperty("--admin-sidebar-text-muted", scheme.sidebarTextMuted)
    root.style.setProperty("--admin-sidebar-active-bg", scheme.sidebarActiveBg)
    root.style.setProperty("--admin-sidebar-active-text", scheme.sidebarActiveText)
    root.style.setProperty("--admin-sidebar-hover-bg", scheme.sidebarHoverBg)
    root.style.setProperty("--admin-accent", scheme.accent)
    root.style.setProperty("--admin-accent-hover", scheme.accentHover)
  }, [scheme])

  return (
    <AdminThemeContext.Provider value={{ scheme, setSchemeId }}>
      {children}
    </AdminThemeContext.Provider>
  )
}
