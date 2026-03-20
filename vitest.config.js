import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate browser environment
    environment: 'jsdom',
    
    // Setup file to run before all tests
    setupFiles: ['./src/setupTests.js'],
    
    // Global test utilities (no need to import in every test file)
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.config.js',
        'dist/',
        'whatsapp-bridge/public/',
      ],
    },
    
    // Test file patterns
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Timeout for tests (5 seconds)
    testTimeout: 5000,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
