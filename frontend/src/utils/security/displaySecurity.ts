import { PublicKey } from '@solana/web3.js';

export class DisplaySecurity {
  // Securely format wallet address for display
  static formatWalletAddress(publicKey: PublicKey | string | null, length: number = 4): string {
    if (!publicKey) return 'Not connected';
    
    const address = typeof publicKey === 'string' ? publicKey : publicKey.toBase58();
    
    if (address.length <= length * 2) {
      return address;
    }
    
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }

  // Secure formatting of financial amounts
  static formatSOLAmount(lamports: number | null, decimals: number = 4): string {
    if (lamports === null || lamports === undefined) {
      return '0.0000 SOL';
    }
    
    const sol = lamports / 1e9;
    return `${sol.toFixed(decimals)} SOL`;
  }

  // Mask sensitive financial data
  static maskSensitiveAmount(amount: number, showLast: number = 2): string {
    const amountStr = amount.toString();
    if (amountStr.length <= showLast) {
      return '*'.repeat(amountStr.length);
    }
    
    const masked = '*'.repeat(amountStr.length - showLast);
    const visible = amountStr.slice(-showLast);
    return `${masked}${visible}`;
  }

  // Safely render user-generated content
  static sanitizeForDisplay(content: string): string {
    if (!content) return '';
    
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Format betting odds safely
  static formatOdds(odds: number): string {
    if (!odds || odds < 1) return '1.00x';
    
    // Prevent display of extremely high odds that might be errors
    const safeOdds = Math.min(odds, 999999);
    return `${safeOdds.toFixed(2)}x`;
  }

  // Format percentage with bounds checking
  static formatPercentage(value: number, decimals: number = 1): string {
    if (!value || isNaN(value)) return '0.0%';
    
    // Clamp percentage between 0 and 100
    const safeValue = Math.max(0, Math.min(100, value));
    return `${safeValue.toFixed(decimals)}%`;
  }

  // Secure timestamp formatting
  static formatTimestamp(timestamp: Date | number | string): string {
    try {
      const date = new Date(timestamp);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Prevent displaying future dates that might be suspicious
      const now = new Date();
      const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      
      if (date > maxFuture) {
        return 'Invalid date';
      }
      
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  }

  // Format relative time safely
  static formatRelativeTime(timestamp: Date | number | string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      if (isNaN(diffMs)) return 'Invalid time';
      
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSeconds < 60) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Invalid time';
    }
  }

  // Safely display transaction signature
  static formatTransactionSignature(signature: string | null, length: number = 8): string {
    if (!signature) return 'No signature';
    
    if (signature.length <= length * 2) {
      return signature;
    }
    
    return `${signature.slice(0, length)}...${signature.slice(-length)}`;
  }

  // Format bet status with safe values
  static formatBetStatus(status: string | null): string {
    if (!status) return 'Unknown';
    
    const validStatuses = ['OPEN', 'MATCHED', 'SETTLED', 'CANCELLED'];
    const upperStatus = status.toString().toUpperCase();
    
    if (validStatuses.includes(upperStatus)) {
      return upperStatus;
    }
    
    return 'Unknown';
  }

  // Get safe color class for status
  static getStatusColorClass(status: string): string {
    const safeStatus = this.formatBetStatus(status);
    
    switch (safeStatus) {
      case 'OPEN':
        return 'text-blue-600 dark:text-blue-400';
      case 'MATCHED':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'SETTLED':
        return 'text-green-600 dark:text-green-400';
      case 'CANCELLED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  // Secure number formatting with bounds
  static formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    
    // Prevent display of extremely large numbers
    const safeValue = Math.min(Math.abs(value), 999999999999);
    return safeValue.toFixed(decimals);
  }

  // Validate and format event category
  static formatEventCategory(category: string | null): string {
    if (!category) return 'Other';
    
    const validCategories = [
      'Sports', 'Basketball', 'Soccer', 'Football', 'Tennis',
      'Crypto', 'Bitcoin', 'Ethereum', 'Solana',
      'Politics', 'Elections', 'Policy',
      'Entertainment', 'Movies', 'Music',
      'Weather', 'Technology', 'Business',
      'Other'
    ];
    
    const sanitized = this.sanitizeForDisplay(category);
    
    // Check if it's a valid category
    if (validCategories.includes(sanitized)) {
      return sanitized;
    }
    
    // Return 'Other' for unknown categories
    return 'Other';
  }

  // Safely truncate text for display
  static truncateText(text: string | null, maxLength: number = 50): string {
    if (!text) return '';
    
    const sanitized = this.sanitizeForDisplay(text);
    
    if (sanitized.length <= maxLength) {
      return sanitized;
    }
    
    return `${sanitized.slice(0, maxLength - 3)}...`;
  }

  // Format confidence score safely
  static formatConfidence(confidence: number | null): string {
    if (confidence === null || confidence === undefined || isNaN(confidence)) {
      return '0%';
    }
    
    // Clamp between 0 and 100
    const safeConfidence = Math.max(0, Math.min(100, confidence * 100));
    return `${safeConfidence.toFixed(0)}%`;
  }
}