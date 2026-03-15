/**
 * Server Entry Point
 * Start Express server, connect to MongoDB, and initialize Socket.io
 */

import { createServer } from 'http'
import app from './app'
import config from './config/env'
import { connectDB } from './config/db'
import { initSocketService } from './services/socketService'

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB()

    // Create HTTP server
    const httpServer = createServer(app)

    // Initialize Socket.io
    const socketService = initSocketService(httpServer)

    // Start server
    httpServer.listen(config.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AgentForge Backend Server                            ║
║                                                           ║
║   Environment: ${config.NODE_ENV.padEnd(43)}║
║   Port: ${String(config.PORT).padEnd(50)}║
║   MongoDB: Connected ✅                                   ║
║   WebSocket: Ready ✅                                     ║
║                                                           ║
║   API Endpoints:                                          ║
║   - Health: http://localhost:${config.PORT}/health               ║
║   - Auth: http://localhost:${config.PORT}/api/v1/auth            ║
║   - Agents: http://localhost:${config.PORT}/api/v1/agents        ║
║   - Tasks: http://localhost:${config.PORT}/api/v1/tasks          ║
║   - Teams: http://localhost:${config.PORT}/api/v1/teams          ║
║                                                           ║
║   WebSocket:                                              ║
║   - URL: ws://localhost:${config.PORT}                           ║
║   - Auth: Required (JWT token)                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `)

      // Log Socket.io statistics every 30 seconds
      setInterval(() => {
        const connectedUsers = socketService.getConnectedUsersCount()
        const activeRooms = socketService.getActiveRooms()

        if (connectedUsers > 0) {
          console.log(`📊 Socket.io Stats: ${connectedUsers} users, ${activeRooms.length} active rooms`)
        }
      }, 30000)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
