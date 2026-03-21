import { useState, useEffect } from 'react'

/**
 * Custom hook that debounces a value
 * Useful for search inputs, form validation, or any value that changes frequently
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {any} The debounced value
 * 
 * @example
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *   
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search with debouncedSearchTerm
 *       fetchSearchResults(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 *   
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes (or component unmounts)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
