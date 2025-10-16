// Environment configuration
export const config = {
  solana: {
    network: process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet',
    rpcUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com',
    localRpcUrl: 'http://127.0.0.1:8899',
  },
  contracts: {
    shin2chinPool: {
      programId: '11111111111111111111111111111112', // Mock program ID - will be replaced with actual deployed program ID
      idl: {
        version: "0.1.0",
        name: "shin2chin_pool",
        instructions: [
          {
            name: "initializeEvent",
            accounts: [
              { name: "event", isMut: true, isSigner: false },
              { name: "admin", isMut: true, isSigner: true },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "teamA", type: "string" },
              { name: "teamB", type: "string" },
              { name: "matchStartTime", type: "i64" }
            ]
          },
          {
            name: "placeBet",
            accounts: [
              { name: "event", isMut: true, isSigner: false },
              { name: "bet", isMut: true, isSigner: false },
              { name: "user", isMut: true, isSigner: true },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "team", type: "bool" },
              { name: "amount", type: "u64" }
            ]
          },
          {
            name: "autoBalance",
            accounts: [
              { name: "event", isMut: true, isSigner: false },
              { name: "admin", isMut: true, isSigner: true }
            ],
            args: []
          },
          {
            name: "settleEvent",
            accounts: [
              { name: "event", isMut: true, isSigner: false },
              { name: "admin", isMut: true, isSigner: true }
            ],
            args: [
              { name: "winner", type: "bool" }
            ]
          },
          {
            name: "claimWinnings",
            accounts: [
              { name: "event", isMut: true, isSigner: false },
              { name: "bet", isMut: true, isSigner: false },
              { name: "user", isMut: true, isSigner: true },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: []
          }
        ],
        accounts: [
          {
            name: "Event",
            type: {
              kind: "struct",
              fields: [
                { name: "teamA", type: "string" },
                { name: "teamB", type: "string" },
                { name: "teamAPool", type: "u64" },
                { name: "teamBPool", type: "u64" },
                { name: "matchStartTime", type: "i64" },
                { name: "balanced", type: "bool" },
                { name: "settled", type: "bool" },
                { name: "winner", type: { option: "bool" } },
                { name: "admin", type: "publicKey" }
              ]
            }
          },
          {
            name: "Bet",
            type: {
              kind: "struct",
              fields: [
                { name: "user", type: "publicKey" },
                { name: "event", type: "publicKey" },
                { name: "amount", type: "u64" },
                { name: "team", type: "bool" },
                { name: "timestamp", type: "i64" },
                { name: "status", type: { defined: "BetStatus" } }
              ]
            }
          }
        ],
        types: [
          {
            name: "BetStatus",
            type: {
              kind: "enum",
              variants: [
                { name: "Active" },
                { name: "Refunded" },
                { name: "Won" },
                { name: "Lost" },
                { name: "Claimed" }
              ]
            }
          }
        ]
      }
    }
  },
  app: {
    name: 'Shin2Chin Betting Platform',
    version: '0.0.1',
    description: 'An auto-balancing pool betting platform for combat sports on Solana',
  },
} as const

export type Config = typeof config