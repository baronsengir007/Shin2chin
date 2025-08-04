import { config } from './core/config'
import { logger } from './core/utils'

function App() {
  // Log application startup
  logger.info('Shin2Chin Frontend Started', { 
    version: config.app.version,
    network: config.solana.network,
    rpcUrl: config.solana.rpcUrl
  })

  return (
    <div className="App">
      <header className="app-header">
        <h1>{config.app.name}</h1>
        <p className="subtitle">Layer 1 Foundation Ready</p>
        <div className="status-info">
          <p><strong>Version:</strong> {config.app.version}</p>
          <p><strong>Network:</strong> {config.solana.network}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
        </div>
      </header>
      
      <main className="app-main">
        <div className="foundation-status">
          <h2>✅ Layer 1 Core Foundation</h2>
          <ul>
            <li>Vite + React 18 + TypeScript configured</li>
            <li>Solana development environment ready</li>
            <li>Core configuration and utilities available</li>
            <li>Project structure established</li>
          </ul>
        </div>
        
        <div className="next-steps">
          <h3>Ready for Layer 2 Implementation</h3>
          <p>State management (Zustand) and blockchain integration</p>
        </div>
      </main>
    </div>
  )
}

export default App