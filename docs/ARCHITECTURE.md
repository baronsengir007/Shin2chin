# Shin2Chin Betting Platform Architecture

## System Overview

The Shin2Chin platform is an AI-powered peer-to-peer crypto betting application built on the Solana blockchain. This document outlines the refined architecture design that satisfies the core user stories with specific enhancements to prevent downstream problems.

## Component Architecture

### Core Components

- **Gary AI Interface (React)** with Confirmation Protocol
- **AI Backend** (HeyAnon SDK)
- **Wallet Connection** (Phantom/Solflare) with Transaction Handler
- **Solana Betting Program** (Anchor) with Explicit PDA Structure
- **Oracle Integration**
- **Admin Interface**
- **Payout Handler** with Timer Service
- **UI State Manager**
- **State Sync Service**
- **Error Management Service**
- **Testing Framework**

### Component Diagram

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Frontend UI  │     │  Admin Panel  │     │ Wallet Apps   │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
┌───────┴───────┐     ┌───────┴───────┐     ┌───────┴───────┐
│   Gary AI     │     │ Event Manager │     │  Transaction  │
│  Interface    │◄────┤               │     │   Handler     │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
┌───────┴───────┐     ┌───────┴───────┐     ┌───────┴───────┐
│  HeyAnon SDK  │     │    State      │     │   Solana      │
│  Integration  │     │ Sync Service  │     │  Blockchain   │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        └─────────────┬───────┴─────────────┬───────┘
                      │                     │
              ┌───────┴───────┐     ┌───────┴───────┐
              │    Betting    │     │    Oracle     │
              │    Program    │────►│    Program    │
              └───────┬───────┘     └───────┬───────┘
                      │                     │
                      └─────────────┬───────┘
                                    │
                            ┌───────┴───────┐
                            │ Payout Handler│
                            │ & Timer Svc   │
                            └───────────────┘
```

## Data Flow

### Betting Flow
1. User input → Gary AI (with Confirmation Protocol)
2. Intent parsing → bet preview
3. Explicit confirmation → wallet (with Transaction Handler)
4. Solana program (with explicit PDA structure)
5. Oracle integration
6. Payout handler (with Timer Service)
7. State Sync Service updates UI
8. Error Management Service handles/reports errors throughout

### Admin Flow
1. Admin input → event form
2. Solana program/oracle → event listing
3. All flows monitored by State Sync and Error Management

## Component Responsibilities

### Timer Service
- Ensures 30-second payout requirement
- Implements retry logic on oracle delays
- Provides user payout status updates

### Confirmation Protocol
- Explicit 'Yes/No' confirmation flow
- Clear stake/team display
- Standardized messaging format

### State Sync Service
- Monitors blockchain state
- Updates UI in real-time
- Handles recovery from interruptions

### Transaction Handler
- Implements retry logic
- Monitors transaction status
- Provides user feedback on transaction progress

### Explicit PDA Structure
- Clearly defines event accounts
- Structures bet accounts
- Manages admin accounts

### Error Management Service
- Standardized error handling
- User-friendly error messages
- Recovery suggestions for common issues

## Design Rationale

- Each architectural refinement addresses specific requirements from the user stories
- Components are designed with minimal coupling for easier maintenance
- The architecture prioritizes user experience while ensuring blockchain integration
- No feature creep: Only critical components are included