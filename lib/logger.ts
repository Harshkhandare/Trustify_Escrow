import winston from 'winston'

// Only use file transports on server side
const transports: winston.transport[] = []

if (typeof window === 'undefined') {
  // Server-side only
  try {
    const path = require('path')
    const fs = require('fs')
    const logsDir = path.join(process.cwd(), 'logs')
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    
    transports.push(
      new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
    )
  } catch (error) {
    // File system not available, skip file logging
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'escrow-app' },
  transports,
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default logger

