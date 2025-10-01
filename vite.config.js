import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Proxy API requests to backend server
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    // Explicitly expose environment variables to the client (optional, but good for clarity)
    define: {
      // You can expose non-VITE_ prefixed env vars here if needed
      // 'process.env.SOME_KEY': JSON.stringify(env.SOME_KEY)
    },
  }
})
