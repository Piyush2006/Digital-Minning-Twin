import { create } from 'zustand'

// UI chrome state — collapse/expand of every major widget, so the 3D twin stays hero.
export const useUI = create((set) => ({
  kpiOpen: true,
  aiOpen: true,
  rightTab: 'status',      // 'status' | 'flow' | 'weather'
  controlOpen: false,
  dock: null,              // null | 'alerts' | 'ai' | 'reports' | 'history' | 'maintenance' | 'settings'
  simSpeed: 1,

  toggleKpi: () => set(s => ({ kpiOpen: !s.kpiOpen })),
  toggleAi: () => set(s => ({ aiOpen: !s.aiOpen })),
  setRightTab: (t) => set({ rightTab: t }),
  setControlOpen: (v) => set({ controlOpen: v }),
  setDock: (d) => set(s => ({ dock: s.dock === d ? null : d })),
  setSimSpeed: (v) => set({ simSpeed: v }),
}))
