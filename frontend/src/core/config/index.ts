// Environment configuration
export const config = {
  solana: {
    network: process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet',
    rpcUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com',
    localRpcUrl: 'http://127.0.0.1:8899',
  },
  app: {
    name: 'Shin2Chin Betting Platform',
    version: '0.0.1',
    description: 'A peer-to-peer betting platform for combat sports on Solana',
  },
} as const

export type Config = typeof config