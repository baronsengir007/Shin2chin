# Refined MCP-Enhanced Architecture

## Component Changes
- Gary AI Interface (React) + Confirmation Protocol
- AI Backend (HeyAnon SDK)
- Wallet Connection (Phantom/Solflare) + Transaction Handler
- Solana Betting Program (Anchor) + Explicit PDA Structure
- Oracle Integration
- Admin Interface
- Payout Handler + Timer Service
- UI State Manager
- State Sync Service (NEW)
- Error Management Service (NEW)
- Testing Framework

## Updated Data Flow
- User input → Gary AI (with Confirmation Protocol) → intent parse → bet preview → explicit confirmation → wallet (with Transaction Handler) → Solana program (with explicit PDA structure) → oracle → payout handler (with Timer Service) → State Sync Service updates UI → Error Management Service handles/report errors throughout.
- Admin input → event form → Solana program/oracle → event listing. All flows monitored by State Sync and Error Management.

## Component Responsibilities
- Timer Service: Ensures 30s payout, retries on oracle delay, user payout status
- Confirmation Protocol: Explicit 'Yes/No' confirmation, clear stake/team display, standardized messaging
- State Sync Service: Monitors blockchain state, updates UI, handles recovery
- Transaction Handler: Retry logic, status monitoring, user feedback
- Explicit PDA Structure: Defines event, bet, admin accounts
- Error Management Service: Standardized errors, user-friendly messages, recovery suggestions

## Rationale
- Each refinement is the minimal addition needed to prevent specific downstream problems and directly serves user stories.
- No feature creep: Only the 6 critical refinements are included.

## Architecture Design Complete

# Architecture Design

> **Note**: This document will be populated during Phase 1 - Architecture Design.

## Overview

This document will describe the architectural design of the Shin2Chin Solana AI Betting Platform, including:

- System components and their interactions
- Smart contract architecture
- Data flow diagrams
- Security considerations
- Scalability approach

## Core Components

### Planned Architecture Components

1. **Solana Smart Contracts**
   - Betting program (main contract)
   - Oracle integration 
   - Token handling

2. **Gary AI Integration**
   - Conversational interface
   - Betting intent extraction
   - Natural language understanding

3. **Wallet Integration**
   - Phantom and Solflare support
   - Transaction signing flow
   - Account management

4. **Frontend Application**
   - React component structure
   - State management
   - UI/UX considerations

5. **Admin Interface**
   - Event management
   - Platform monitoring
   - Oracle configuration

## Future Updates

This document will be fully populated during Phase 1 of the project development cycle. The architecture will be designed to fulfill the 5 core user stories while maintaining a focus on:

- Non-custodial peer-to-peer betting
- Conversational AI interface
- Minimal, focused UI
- Secure wallet interactions
- Automated settlement