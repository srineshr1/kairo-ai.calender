import { useState, useEffect } from 'react'

/**
 * Custom hook for localStorage state management
 * Automatically syncs state with localStorage and handles JSON serialization
 * 
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist in localStorage
 * @returns {[any, function]} Tuple of [storedValue, setValue]
 * 
 * @example
 * function DarkModeToggle() {
 *   const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false)
 *   
 *   return (
 *     <button onClick={() => setIsDarkMode(!isDarkMode)}>
 *       {isDarkMode ? 'Light Mode' : 'Dark Mode'}
 *     </button>
 *   )
 * }
 * 
 * @example
 * function UserPreferences() {
 *   const [preferences, setPreferences] = useLocalStorage('userPrefs', {
 *     theme: 'light',
 *     language: 'en'
 *   })
 *   
 *   return (
 *     <div>
 *       <select
 *         value={preferences.theme}
 *         onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
 *       >
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *       </select>
 *     </div>
 *   )
 * }
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
