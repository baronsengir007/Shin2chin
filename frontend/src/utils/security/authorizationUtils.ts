import { PublicKey } from '@solana/web3.js';

export interface AuthorizationContext {
  userPublicKey: PublicKey | null;
  isConnected: boolean;
  permissions: string[];
}

export class AuthorizationUtils {
  // Check if user can create bets
  static canCreateBet(context: AuthorizationContext): boolean {
    return context.isConnected && context.userPublicKey !== null;
  }

  // Check if user can match/accept bets
  static canMatchBet(
    context: AuthorizationContext, 
    betCreator: PublicKey
  ): boolean {
    if (!context.isConnected || !context.userPublicKey) {
      return false;
    }

    // Users cannot match their own bets
    return !context.userPublicKey.equals(betCreator);
  }

  // Check if user can settle a bet
  static canSettleBet(
    context: AuthorizationContext,
    betCreator: PublicKey,
    betAcceptor: PublicKey | null
  ): boolean {
    if (!context.isConnected || !context.userPublicKey) {
      return false;
    }

    // Only participants can settle
    return (
      context.userPublicKey.equals(betCreator) ||
      (betAcceptor && context.userPublicKey.equals(betAcceptor))
    );
  }

  // Check if user can cancel a bet
  static canCancelBet(
    context: AuthorizationContext,
    betCreator: PublicKey,
    betStatus: string
  ): boolean {
    if (!context.isConnected || !context.userPublicKey) {
      return false;
    }

    // Only creator can cancel, and only if bet is still open
    return (
      context.userPublicKey.equals(betCreator) &&
      betStatus === 'OPEN'
    );
  }

  // Check if user can view bet details
  static canViewBetDetails(
    context: AuthorizationContext,
    isPublicBet: boolean = true
  ): boolean {
    // Public bets can be viewed by anyone
    if (isPublicBet) {
      return true;
    }

    // Private bets require connection
    return context.isConnected;
  }

  // Check if user can create events
  static canCreateEvent(context: AuthorizationContext): boolean {
    return context.isConnected && context.userPublicKey !== null;
  }

  // Check if user owns a specific account/bet
  static isOwner(
    context: AuthorizationContext,
    ownerPublicKey: PublicKey
  ): boolean {
    if (!context.isConnected || !context.userPublicKey) {
      return false;
    }

    return context.userPublicKey.equals(ownerPublicKey);
  }

  // Check if user is participant in a bet
  static isParticipant(
    context: AuthorizationContext,
    betCreator: PublicKey,
    betAcceptor: PublicKey | null
  ): boolean {
    if (!context.isConnected || !context.userPublicKey) {
      return false;
    }

    return (
      context.userPublicKey.equals(betCreator) ||
      (betAcceptor && context.userPublicKey.equals(betAcceptor))
    );
  }

  // Validate bet ownership before allowing modifications
  static validateBetOwnership(
    userPublicKey: PublicKey | null,
    betCreator: PublicKey
  ): { isValid: boolean; error?: string } {
    if (!userPublicKey) {
      return { isValid: false, error: 'Wallet not connected' };
    }

    if (!userPublicKey.equals(betCreator)) {
      return { isValid: false, error: 'You do not own this bet' };
    }

    return { isValid: true };
  }

  // Validate sufficient balance for betting
  static validateSufficientBalance(
    balance: number | null,
    betAmount: number,
    margin: number = 0.001 // SOL for transaction fees
  ): { isValid: boolean; error?: string } {
    if (balance === null) {
      return { isValid: false, error: 'Unable to check balance' };
    }

    const requiredAmount = betAmount + margin;
    const balanceSOL = balance / 1e9;

    if (balanceSOL < requiredAmount) {
      return { 
        isValid: false, 
        error: `Insufficient balance. Required: ${requiredAmount.toFixed(4)} SOL, Available: ${balanceSOL.toFixed(4)} SOL` 
      };
    }

    return { isValid: true };
  }

  // Check anti-self-betting rule
  static validateAntiSelfBetting(
    userPublicKey: PublicKey | null,
    betCreator: PublicKey
  ): { isValid: boolean; error?: string } {
    if (!userPublicKey) {
      return { isValid: false, error: 'Wallet not connected' };
    }

    if (userPublicKey.equals(betCreator)) {
      return { isValid: false, error: 'You cannot bet against yourself' };
    }

    return { isValid: true };
  }

  // Validate bet state transitions
  static validateBetStateTransition(
    currentStatus: string,
    newStatus: string,
    userRole: 'creator' | 'acceptor' | 'other'
  ): { isValid: boolean; error?: string } {
    const validTransitions: { [key: string]: string[] } = {
      'OPEN': ['MATCHED', 'CANCELLED'],
      'MATCHED': ['SETTLED', 'CANCELLED'],
      'SETTLED': [], // Final state
      'CANCELLED': [], // Final state
    };

    if (!validTransitions[currentStatus]) {
      return { isValid: false, error: 'Invalid current bet status' };
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return { 
        isValid: false, 
        error: `Cannot transition from ${currentStatus} to ${newStatus}` 
      };
    }

    // Additional role-based validation
    if (newStatus === 'CANCELLED' && userRole === 'acceptor') {
      return { isValid: false, error: 'Only bet creator can cancel' };
    }

    return { isValid: true };
  }

  // Generate authorization context from wallet state
  static createAuthContext(
    publicKey: PublicKey | null,
    connected: boolean,
    permissions: string[] = []
  ): AuthorizationContext {
    return {
      userPublicKey: publicKey,
      isConnected: connected,
      permissions,
    };
  }

  // Check if operation requires user interaction (for mobile wallet compliance)
  static requiresUserInteraction(operation: string): boolean {
    const userInteractionOperations = [
      'connect_wallet',
      'disconnect_wallet',
      'sign_transaction',
      'approve_transaction',
      'create_bet',
      'match_bet',
      'settle_bet',
    ];

    return userInteractionOperations.includes(operation);
  }

  // Validate permissions for admin operations
  static hasAdminPermission(
    context: AuthorizationContext,
    requiredPermission: string
  ): boolean {
    return context.permissions.includes(requiredPermission) ||
           context.permissions.includes('admin');
  }

  // Rate limiting check (basic implementation)
  static checkRateLimit(
    userPublicKey: PublicKey | null,
    operation: string,
    maxOperations: number = 10,
    timeWindowMs: number = 60000 // 1 minute
  ): { allowed: boolean; error?: string } {
    if (!userPublicKey) {
      return { allowed: false, error: 'User not authenticated' };
    }

    // This would typically check against a backend service
    // For now, we'll just allow all operations
    // In production, implement proper rate limiting
    
    return { allowed: true };
  }
}

// Helper type for bet authorization checks
export interface BetAuthorizationInfo {
  creator: PublicKey;
  acceptor: PublicKey | null;
  status: string;
  amount: number;
  isPublic: boolean;
}

// Comprehensive bet authorization checker
export class BetAuthorizationChecker {
  private context: AuthorizationContext;

  constructor(context: AuthorizationContext) {
    this.context = context;
  }

  checkAllPermissions(bet: BetAuthorizationInfo): {
    canView: boolean;
    canMatch: boolean;
    canSettle: boolean;
    canCancel: boolean;
    isOwner: boolean;
    isParticipant: boolean;
  } {
    return {
      canView: AuthorizationUtils.canViewBetDetails(this.context, bet.isPublic),
      canMatch: AuthorizationUtils.canMatchBet(this.context, bet.creator),
      canSettle: AuthorizationUtils.canSettleBet(this.context, bet.creator, bet.acceptor),
      canCancel: AuthorizationUtils.canCancelBet(this.context, bet.creator, bet.status),
      isOwner: AuthorizationUtils.isOwner(this.context, bet.creator),
      isParticipant: AuthorizationUtils.isParticipant(this.context, bet.creator, bet.acceptor),
    };
  }
}