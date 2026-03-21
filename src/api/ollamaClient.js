/**
 * Ollama API Client
 * Centralized client for interacting with the Ollama LLM API.
 * Handles all HTTP communication, error handling, and response parsing for Ollama.
 */

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'

/**
 * Custom error class for Ollama-specific errors
 */
export class OllamaError extends Error {
  constructor(message, status, originalError) {
    super(message)
    this.name = 'OllamaError'
    this.status = status
    this.originalError = originalError
  }
}

/**
 * Generate text using Ollama API
 * 
 * @param {Object} options - Generation options
 * @param {string} options.model - Model name (e.g., 'llama3.2:3b')
 * @param {string} options.prompt - Prompt text to send to the model
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @param {Object} [options.options] - Additional Ollama options (temperature, etc.)
 * @returns {Promise<Object>} Response from Ollama API with 'response' field
 * @throws {OllamaError} If the request fails or returns an error
 * 
 * @example
 * const response = await generateText({
 *   model: 'llama3.2:3b',
 *   prompt: 'What is the capital of France?',
 *   options: { temperature: 0.1 }
 * })
 * console.log(response.response) // "Paris is the capital of France..."
 */
export async function generateText({ model, prompt, stream = false, options = {} }) {
  if (!model) {
    throw new OllamaError('Model name is required', null, null)
  }
  if (!prompt) {
    throw new OllamaError('Prompt is required', null, null)
  }

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model, 
        prompt,
        stream,
        options
      }),
    })

    // Handle HTTP errors with specific messages
    if (!res.ok) {
      if (res.status === 404) {
        throw new OllamaError(
          `Model "${model}" not found. Try: ollama pull ${model}`,
          404,
          null
        )
      } else if (res.status === 500) {
        throw new OllamaError(
          'Ollama server error. Try restarting: ollama serve',
          500,
          null
        )
      } else {
        throw new OllamaError(
          `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          null
        )
      }
    }

    // Parse response safely
    let data
    try {
      data = await res.json()
    } catch (parseErr) {
      throw new OllamaError(
        'Invalid response from Ollama server',
        null,
        parseErr
      )
    }

    // Validate response has required fields
    if (!data.response && data.response !== '') {
      throw new OllamaError(
        'Ollama response missing "response" field',
        null,
        null
      )
    }

    return data
  } catch (err) {
    // If it's already an OllamaError, rethrow it
    if (err instanceof OllamaError) {
      throw err
    }

    // Handle network errors
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new OllamaError(
        'Failed to connect to Ollama. Make sure Ollama is running (ollama serve)',
        null,
        err
      )
    }

    // Handle timeout errors
    if (err.name === 'AbortError' || err.message.includes('timeout')) {
      throw new OllamaError(
        'Request timed out. Ollama may be overloaded or the model is too slow.',
        null,
        err
      )
    }

    // Unknown error
    throw new OllamaError(
      err.message || 'Unknown error occurred while connecting to Ollama',
      null,
      err
    )
  }
}

/**
 * Check if Ollama is running and reachable
 * 
 * @returns {Promise<boolean>} True if Ollama is online, false otherwise
 * 
 * @example
 * const isOnline = await checkHealth()
 * if (isOnline) {
 *   console.log('Ollama is running')
 * }
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * List all available models
 * 
 * @returns {Promise<Array>} List of model objects with name, size, etc.
 * @throws {OllamaError} If the request fails
 * 
 * @example
 * const models = await listModels()
 * console.log(models) // [{ name: 'llama3.2:3b', size: '2.0 GB', ... }]
 */
export async function listModels() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
    })

    if (!res.ok) {
      throw new OllamaError(
        `Failed to list models: HTTP ${res.status}`,
        res.status,
        null
      )
    }

    const data = await res.json()
    return data.models || []
  } catch (err) {
    if (err instanceof OllamaError) {
      throw err
    }

    throw new OllamaError(
      'Failed to connect to Ollama while listing models',
      null,
      err
    )
  }
}

/**
 * Get the configured Ollama URL
 * 
 * @returns {string} The Ollama API base URL
 * 
 * @example
 * console.log(getOllamaUrl()) // "http://localhost:11434"
 */
export function getOllamaUrl() {
  return OLLAMA_URL
}
