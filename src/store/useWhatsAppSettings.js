import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWhatsAppSettings = create(
  persist(
    (set, get) => ({
      enabled: true,
      selectedGroups: [],
      
      toggleEnabled: () => set((s) => ({ enabled: !s.enabled })),
      
      addGroup: (name, number) => set((s) => {
        const id = 'g' + Date.now() + Math.random().toString(36).slice(2, 6)
        const newGroup = { id, name: name.trim(), number: number.trim() }
        return { selectedGroups: [...s.selectedGroups, newGroup] }
      }),
      
      removeGroup: (id) => set((s) => ({
        selectedGroups: s.selectedGroups.filter(g => g.id !== id)
      })),
      
      updateGroup: (id, name, number) => set((s) => ({
        selectedGroups: s.selectedGroups.map(g => 
          g.id === id ? { ...g, name: name.trim(), number: number.trim() } : g
        )
      })),
      
      isGroupSelected: (groupName, groupNumber) => {
        const { selectedGroups } = get()
        return selectedGroups.some(g => 
          g.name.toLowerCase() === groupName?.toLowerCase() ||
          g.number === groupNumber
        )
      },
    }),
    {
      name: 'whatsapp-settings',
    }
  )
)
