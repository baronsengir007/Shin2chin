import { Connection, PublicKey } from '@solana/web3.js';

export class WebSocketManager {
  private connections: Map<string, Connection> = new Map();
  private subscriptions: Map<string, number> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  createConnection(endpoint: string): Connection {
    if (this.connections.has(endpoint)) {
      return this.connections.get(endpoint)!;
    }

    const connection = new Connection(endpoint, {
      commitment: 'confirmed',
      wsEndpoint: endpoint.replace('https', 'wss'),
    });

    this.connections.set(endpoint, connection);
    return connection;
  }

  async subscribeToAccount(
    connection: Connection,
    publicKey: PublicKey,
    callback: (accountInfo: any) => void
  ): Promise<number> {
    try {
      const subscriptionId = connection.onAccountChange(
        publicKey,
        callback,
        'confirmed'
      );

      const key = publicKey.toString();
      this.subscriptions.set(key, subscriptionId);
      this.reconnectAttempts.set(key, 0);

      return subscriptionId;
    } catch (error) {
      console.error('Account subscription failed:', error);
      throw error;
    }
  }

  async unsubscribeFromAccount(
    connection: Connection,
    publicKey: PublicKey
  ): Promise<void> {
    const key = publicKey.toString();
    const subscriptionId = this.subscriptions.get(key);

    if (subscriptionId) {
      try {
        await connection.removeAccountChangeListener(subscriptionId);
        this.subscriptions.delete(key);
        this.reconnectAttempts.delete(key);
      } catch (error) {
        console.error('Unsubscribe failed:', error);
      }
    }
  }

  cleanup(): void {
    this.subscriptions.clear();
    this.reconnectAttempts.clear();
    this.connections.clear();
  }

  private async handleReconnection(
    endpoint: string,
    publicKey: PublicKey,
    callback: (accountInfo: any) => void
  ): Promise<void> {
    const key = publicKey.toString();
    const attempts = this.reconnectAttempts.get(key) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${key}`);
      return;
    }

    this.reconnectAttempts.set(key, attempts + 1);

    setTimeout(async () => {
      try {
        const connection = this.createConnection(endpoint);
        await this.subscribeToAccount(connection, publicKey, callback);
        this.reconnectAttempts.set(key, 0);
      } catch (error) {
        console.error(`Reconnection attempt ${attempts + 1} failed:`, error);
        await this.handleReconnection(endpoint, publicKey, callback);
      }
    }, this.reconnectDelay * Math.pow(2, attempts));
  }
}

export const createValidatedState = <T>(
  initialState: T,
  validator: (state: T) => boolean
): T => {
  if (!validator(initialState)) {
    throw new Error('Initial state validation failed');
  }
  return initialState;
};

export const batchStateUpdates = <T>(
  updates: Array<(state: T) => T>
): ((state: T) => T) => {
  return (state: T) => {
    return updates.reduce((acc, update) => update(acc), state);
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
};

export const sanitizePublicKey = (key: string): PublicKey | null => {
  try {
    return new PublicKey(key);
  } catch {
    return null;
  }
};

export const formatBalance = (lamports: number): number => {
  return lamports / 1e9; // Convert lamports to SOL
};

export const validateBetAmount = (amount: number): boolean => {
  return amount > 0 && amount <= Number.MAX_SAFE_INTEGER && !isNaN(amount);
};