// Base TypeScript definitions
export interface AppConfig {
  solana: {
    network: string
    rpcUrl: string
    localRpcUrl: string
  }
  app: {
    name: string
    version: string
    description: string
  }
}

// Basic error types
export interface AppError {
  code: string
  message: string
  details?: unknown
}

// Environment types
export type Environment = 'development' | 'production' | 'test'

// Network types
export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet'

// Basic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>