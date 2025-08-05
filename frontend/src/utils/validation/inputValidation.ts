import { PublicKey } from '@solana/web3.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class InputValidation {
  // Betting amount validation
  static validateBettingAmount(amount: string | number): ValidationResult {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    if (numAmount > 1000000) {
      return { isValid: false, error: 'Amount cannot exceed 1,000,000 SOL' };
    }
    
    // Check for reasonable decimal places (max 9 for SOL)
    const decimalPlaces = amount.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 9) {
      return { isValid: false, error: 'Amount cannot have more than 9 decimal places' };
    }
    
    return { isValid: true };
  }

  // Odds validation
  static validateOdds(odds: string | number): ValidationResult {
    const numOdds = typeof odds === 'string' ? parseFloat(odds) : odds;
    
    if (isNaN(numOdds)) {
      return { isValid: false, error: 'Odds must be a valid number' };
    }
    
    if (numOdds < 1.01) {
      return { isValid: false, error: 'Odds must be at least 1.01' };
    }
    
    if (numOdds > 1000) {
      return { isValid: false, error: 'Odds cannot exceed 1000' };
    }
    
    return { isValid: true };
  }

  // Text input sanitization for XSS prevention
  static sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;')
      .trim();
  }

  // Betting description validation
  static validateBettingDescription(description: string): ValidationResult {
    if (!description || description.trim().length === 0) {
      return { isValid: false, error: 'Description is required' };
    }
    
    if (description.length > 500) {
      return { isValid: false, error: 'Description cannot exceed 500 characters' };
    }
    
    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(description)) {
        return { isValid: false, error: 'Description contains invalid content' };
      }
    }
    
    return { isValid: true };
  }

  // Solana public key validation
  static validatePublicKey(key: string): ValidationResult {
    if (!key || key.trim().length === 0) {
      return { isValid: false, error: 'Public key is required' };
    }
    
    try {
      new PublicKey(key);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid Solana public key format' };
    }
  }

  // Event title validation
  static validateEventTitle(title: string): ValidationResult {
    if (!title || title.trim().length === 0) {
      return { isValid: false, error: 'Event title is required' };
    }
    
    if (title.length < 3) {
      return { isValid: false, error: 'Event title must be at least 3 characters' };
    }
    
    if (title.length > 100) {
      return { isValid: false, error: 'Event title cannot exceed 100 characters' };
    }
    
    // Prevent malicious content
    if (this.containsMaliciousContent(title)) {
      return { isValid: false, error: 'Event title contains invalid content' };
    }
    
    return { isValid: true };
  }

  // URL validation for external links
  static validateURL(url: string): ValidationResult {
    if (!url) {
      return { isValid: true }; // URL is optional
    }
    
    try {
      const parsed = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }
      
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // Check for malicious content patterns
  private static containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /data:/i,
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive form validation
  static validateBetForm(form: {
    amount: string;
    odds: string;
    betOn: string;
    description: string;
  }): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    results.push(this.validateBettingAmount(form.amount));
    results.push(this.validateOdds(form.odds));
    results.push(this.validateEventTitle(form.betOn));
    results.push(this.validateBettingDescription(form.description));
    
    return results;
  }

  // Get first validation error from results
  static getFirstError(results: ValidationResult[]): string | null {
    const firstError = results.find(result => !result.isValid);
    return firstError?.error || null;
  }

  // Check if all validations passed
  static allValid(results: ValidationResult[]): boolean {
    return results.every(result => result.isValid);
  }
}