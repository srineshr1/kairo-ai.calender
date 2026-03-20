import { create } from 'zustand'

let nextId = 0

export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = nextId++
    const newToast = {
      id,
      type: 'info', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 4000,
      ...toast
    }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto-remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }))
      }, newToast.duration)
    }
    
    return id
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  clearToasts: () => set({ toasts: [] })
}))

// Helper functions for common toast types
export const toast = {
  success: (message, title = 'Success') => 
    useToastStore.getState().addToast({ type: 'success', title, message }),
  
  error: (message, title = 'Error') => 
    useToastStore.getState().addToast({ type: 'error', title, message, duration: 6000 }),
  
  warning: (message, title = 'Warning') => 
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  
  info: (message, title = 'Info') => 
    useToastStore.getState().addToast({ type: 'info', title, message }),
}
