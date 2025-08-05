import React from 'react';

interface ExtractedProposal {
  amount: number;
  odds?: number;
  betOn: string;
  confidence: number;
}

export class BetProposalExtractor {
  private static readonly BET_PATTERNS = [
    // Pattern: "$50 on Lakers"
    /\$?(\d+(?:\.\d+)?)\s*(?:on|for)\s+(.+?)(?:\s+at\s+(\d+(?:\.\d+)?)?(?:x|\s+odds)?)?/i,
    // Pattern: "bet 100 SOL that Team wins"
    /bet\s+(\d+(?:\.\d+)?)\s*(?:SOL|sol)?\s*(?:that|on)\s+(.+?)(?:\s+at\s+(\d+(?:\.\d+)?)?)?/i,
    // Pattern: "I'll take Team for $50"
    /(?:I'll|I\s+will)\s+take\s+(.+?)\s+for\s+\$?(\d+(?:\.\d+)?)/i,
  ];

  static extractProposal(text: string): ExtractedProposal | null {
    for (const pattern of this.BET_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1] || match[2]);
        const betOn = (match[2] || match[1]).trim();
        const odds = match[3] ? parseFloat(match[3]) : undefined;

        if (amount > 0 && betOn.length > 0) {
          return {
            amount,
            betOn,
            odds,
            confidence: this.calculateConfidence(text, match),
          };
        }
      }
    }
    return null;
  }

  private static calculateConfidence(text: string, match: RegExpMatchArray): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for explicit bet keywords
    if (text.toLowerCase().includes('bet') || text.toLowerCase().includes('wager')) {
      confidence += 0.2;
    }

    // Higher confidence for currency symbols
    if (text.includes('$') || text.toLowerCase().includes('sol')) {
      confidence += 0.15;
    }

    // Higher confidence for odds mentioned
    if (match[3]) {
      confidence += 0.15;
    }

    return Math.min(confidence, 1.0);
  }

  static formatProposalSummary(proposal: ExtractedProposal): string {
    const oddsText = proposal.odds ? ` at ${proposal.odds}x odds` : '';
    return `Bet ${proposal.amount} SOL on ${proposal.betOn}${oddsText}`;
  }
}