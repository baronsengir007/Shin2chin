// Core utilities and helpers

// Logger utility
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}

// Async utilities
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

// Error handling utilities
export const createError = (code: string, message: string, details?: unknown) => ({
  code,
  message,
  details,
})

// Validation utilities
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Format utilities
export const formatSolAmount = (lamports: number): string => {
  return (lamports / 1_000_000_000).toFixed(4)
}

export const truncateAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}