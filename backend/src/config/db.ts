/**
 * MongoDB Database Configuration
 * Handles connection and error handling
 */

import mongoose from 'mongoose'
import config from './env'

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = config.NODE_ENV === 'test' ? config.MONGODB_TEST_URI : config.MONGODB_URI

    const conn = await mongoose.connect(mongoURI, {
      // Options (most are defaults in Mongoose 6+)
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📁 Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('MongoDB connection closed due to app termination')
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

export default connectDB
