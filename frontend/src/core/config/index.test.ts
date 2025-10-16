import { describe, it, expect } from 'vitest';
import { config } from './index';

describe('Config', () => {
  it('should have correct structure', () => {
    expect(config).toBeDefined();
    expect(config.solana).toBeDefined();
    expect(config.contracts).toBeDefined();
    expect(config.app).toBeDefined();
  });

  it('should have shin2chin pool contract configuration', () => {
    expect(config.contracts.shin2chinPool).toBeDefined();
    expect(config.contracts.shin2chinPool.programId).toBeDefined();
    expect(config.contracts.shin2chinPool.idl).toBeDefined();
  });

  it('should have correct IDL structure', () => {
    const idl = config.contracts.shin2chinPool.idl;
    
    expect(idl.version).toBe('0.1.0');
    expect(idl.name).toBe('shin2chin_pool');
    expect(idl.instructions).toBeDefined();
    expect(idl.accounts).toBeDefined();
    expect(idl.types).toBeDefined();
  });

  it('should have all required instructions', () => {
    const instructions = config.contracts.shin2chinPool.idl.instructions;
    const instructionNames = instructions.map(inst => inst.name);
    
    expect(instructionNames).toContain('initializeEvent');
    expect(instructionNames).toContain('placeBet');
    expect(instructionNames).toContain('autoBalance');
    expect(instructionNames).toContain('settleEvent');
    expect(instructionNames).toContain('claimWinnings');
  });

  it('should have correct account types', () => {
    const accounts = config.contracts.shin2chinPool.idl.accounts;
    const accountNames = accounts.map(acc => acc.name);
    
    expect(accountNames).toContain('Event');
    expect(accountNames).toContain('Bet');
  });

  it('should have correct bet status enum', () => {
    const types = config.contracts.shin2chinPool.idl.types;
    const betStatusType = types.find(type => type.name === 'BetStatus');
    
    expect(betStatusType).toBeDefined();
    expect(betStatusType?.type.kind).toBe('enum');
    expect(betStatusType?.type.variants).toHaveLength(5);
    
    const variantNames = betStatusType?.type.variants.map(v => v.name) || [];
    expect(variantNames).toContain('Active');
    expect(variantNames).toContain('Refunded');
    expect(variantNames).toContain('Won');
    expect(variantNames).toContain('Lost');
    expect(variantNames).toContain('Claimed');
  });
});
