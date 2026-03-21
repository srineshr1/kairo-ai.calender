import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for handling async operations with loading, error, and data states
 * Simplifies async state management and provides automatic cleanup
 * 
 * @returns {Object} Object with execute function and state properties
 * 
 * @example
 * function UserProfile({ userId }) {
 *   const { execute, loading, error, data } = useAsync()
 *   
 *   useEffect(() => {
 *     execute(async () => {
 *       const response = await fetch(`/api/users/${userId}`)
 *       if (!response.ok) throw new Error('Failed to fetch user')
 *       return response.json()
 *     })
 *   }, [userId])
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!data) return null
 *   
 *   return <div>Welcome, {data.name}!</div>
 * }
 * 
 * @example
 * function CreateEventForm() {
 *   const { execute, loading, error, data } = useAsync()
 *   
 *   const handleSubmit = async (formData) => {
 *     await execute(async () => {
 *       const response = await fetch('/api/events', {
 *         method: 'POST',
 *         body: JSON.stringify(formData)
 *       })
 *       if (!response.ok) throw new Error('Failed to create event')
 *       return response.json()
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {loading && <p>Creating event...</p>}
 *       {error && <p className="error">{error.message}</p>}
 *       {data && <p className="success">Event created successfully!</p>}
 *       <button type="submit" disabled={loading}>Create Event</button>
 *     </form>
 *   )
 * }
 */
export function useAsync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  /**
   * Execute an async function and manage its state
   * 
   * @param {Function} asyncFunction - Async function to execute
   * @returns {Promise<any>} Result of the async function
   */
  const execute = useCallback(async (asyncFunction) => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    execute,
    reset,
    loading,
    error,
    data,
    isIdle: !loading && !error && !data,
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && !!data,
  }
}
