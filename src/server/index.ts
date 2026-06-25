import { createServer } from 'node:http'
import { handleRequest } from './routes.js'

export interface ServerOptions {
  port: number
  dataDir?: string
}

/**
 * Find the next available port starting from `startPort`.
 * Returns the first port that is not in use.
 */
export async function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const tryPort = (p: number) => {
      const srv = createServer()
      srv.once('error', () => {
        srv.close()
        tryPort(p + 1)
      })
      srv.once('listening', () => {
        srv.close(() => resolve(p))
      })
      srv.listen(p, '127.0.0.1')
    }
    tryPort(startPort)
  })
}

/**
 * Start the cc-show HTTP server.
 * Returns the actual port it is listening on.
 */
export function startServer(opts: ServerOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const { port, dataDir } = opts
    const server = createServer((req, res) => {
      handleRequest(req, res, dataDir).catch(() => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
        }
        res.end(JSON.stringify({ error: 'Internal Server Error' }))
      })
    })

    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address()
      const actualPort = typeof addr === 'object' && addr ? addr.port : port
      resolve(actualPort)
    })

    // Graceful shutdown on SIGINT/SIGTERM
    const shutdown = () => {
      server.close(() => process.exit(0))
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  })
}
