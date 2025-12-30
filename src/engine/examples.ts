/**
 * OPTIXPRO Reasoning Engine - Example Usage
 * 
 * Demonstrates how to use the reasoning engine with realistic scenarios
 */

import { OptixProEngine } from './index';
import type { MarketSnapshot, UserProfile } from './types';

// ============================================================================
// Example 1: Market Analysis & Strategy Generation
// ============================================================================

const engine = new OptixProEngine();

// Example market snapshot (NIFTY)
const marketSnapshot: MarketSnapshot = {
    symbol: 'NIFTY',
    timestamp: '2025-12-30T09:15:00Z',
    price: 25925.95,
    volume: 1250000,
    iv: 10.2,
    ivRank: 18,
    ivPercentile: 22,
    dte: 7,
    high52w: 26080,
    low52w: 23500,
    atr: 180,
    movingAverages: {
        ma20: 25840,
        ma50: 25720,
        ma200: 24980
    },
    volumeProfile: {
        poc: 25900,
        valueAreaHigh: 26250,
        valueAreaLow: 25750
    }
};

// User profile with constraints
const userProfile: UserProfile = {
    riskTolerance: 'moderate',
    maxLossPerTrade: 5000,
    maxPortfolioRisk: 10,
    allowedStrategies: [],
    bannedStrategies: ['naked-call', 'naked-put'],
    minPOP: 55,
    accountSize: 100000
};

console.log('='.repeat(80));
console.log('EXAMPLE 1: Market Analysis & Strategy Generation');
console.log('='.repeat(80));

// Analyze market regime
const regime = engine.analyzeMarket(marketSnapshot);
console.log('\n--- REGIME ANALYSIS ---');
console.log(JSON.stringify(regime, null, 2));

// Generate strategies
const recommendations = engine.getRecommendations(marketSnapshot, userProfile);
console.log('\n--- STRATEGY RECOMMENDATIONS ---');
console.log(JSON.stringify(recommendations, null, 2));

// ============================================================================
// Example 2: Trade Monitoring
// ============================================================================

console.log('\n');
console.log('='.repeat(80));
console.log('EXAMPLE 2: Trade Monitoring');
console.log('='.repeat(80));

// Active trade example
const activeTrade = {
    id: 'trade-001',
    symbol: 'NIFTY',
    strategy: 'Iron Butterfly',
    entryDate: '2024-12-23',
    entryPrice: 25900,
    expirationDate: '2025-01-02',
    legs: [
        { action: 'BUY' as const, type: 'PUT' as const, strike: 25800, quantity: 1, premium: 28.50 },
        { action: 'SELL' as const, type: 'PUT' as const, strike: 25900, quantity: 1, premium: 48.00 },
        { action: 'SELL' as const, type: 'CALL' as const, strike: 25900, quantity: 1, premium: 52.00 },
        { action: 'BUY' as const, type: 'CALL' as const, strike: 26000, quantity: 1, premium: 32.50 }
    ],
    entryRegime: regime.regime,
    maxLoss: 4100,
    maxProfit: 5900,
    breakeven: [25841, 25959],
    pop: 58,
    currentPrice: 25925.95,
    currentPnL: 2840,
    daysRemaining: 8
};

// Monitor trade health
const healthCheck = engine.monitorTrade(
    activeTrade,
    marketSnapshot,
    regime.regime
);

console.log('\n--- TRADE HEALTH CHECK ---');
console.log(JSON.stringify(healthCheck, null, 2));

// ============================================================================
// Example 3: Post-Trade Analysis
// ============================================================================

console.log('\n');
console.log('='.repeat(80));
console.log('EXAMPLE 3: Post-Trade Analysis');
console.log('='.repeat(80));

// Completed trade lifecycle
const tradeLifecycle = {
    trade: activeTrade,
    entrySnapshot: marketSnapshot,
    exitSnapshot: {
        ...marketSnapshot,
        price: 25950,
        timestamp: '2025-12-31T15:30:00Z'
    },
    entryRegime: regime.regime,
    exitRegime: {
        volatility: 'low' as const,
        structure: 'range-bound' as const,
        direction: 'neutral' as const,
        confidence: 0.82
    },
    adjustments: [],
    exitReason: 'Target profit reached (50% of max profit)',
    actualPnL: 2950,
    exitDate: '2024-12-31'
};

// Perform autopsy
const autopsy = engine.analyzeTrade(tradeLifecycle);

console.log('\n--- TRADE AUTOPSY ---');
console.log(JSON.stringify(autopsy, null, 2));

// ============================================================================
// Example 4: High Volatility / Do Not Trade Scenario
// ============================================================================

console.log('\n');
console.log('='.repeat(80));
console.log('EXAMPLE 4: High Volatility Scenario (Do Not Trade)');
console.log('='.repeat(80));

const highVolSnapshot: MarketSnapshot = {
    ...marketSnapshot,
    iv: 28.5,
    ivRank: 85,
    ivPercentile: 92,
    atr: 450
};

const highVolRegime = engine.analyzeMarket(highVolSnapshot);
console.log('\n--- REGIME ANALYSIS (High Vol) ---');
console.log(JSON.stringify(highVolRegime, null, 2));

const highVolRecommendations = engine.getRecommendations(highVolSnapshot, userProfile);
console.log('\n--- STRATEGY RECOMMENDATIONS (High Vol) ---');
console.log('Strategies:', highVolRecommendations.strategies.map(s => s.name));
console.log('Note: Should recommend NO_TRADE due to high volatility');

// ============================================================================
// Example 5: Thesis Break Detection
// ============================================================================

console.log('\n');
console.log('='.repeat(80));
console.log('EXAMPLE 5: Thesis Break Detection');
console.log('='.repeat(80));

// Market regime changed dramatically
const changedSnapshot: MarketSnapshot = {
    ...marketSnapshot,
    price: 26200, // Broke out of range
    iv: 24.5,
    ivRank: 65
};

const changedRegime = engine.analyzeMarket(changedSnapshot).regime;

const thesisBreakCheck = engine.monitorTrade(
    activeTrade,
    changedSnapshot,
    changedRegime
);

console.log('\n--- THESIS BREAK CHECK ---');
console.log(JSON.stringify(thesisBreakCheck, null, 2));
console.log('\nExpected: Should detect thesis break and recommend immediate closure');

console.log('\n');
console.log('='.repeat(80));
console.log('All examples completed successfully!');
console.log('='.repeat(80));
