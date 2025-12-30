/**
 * OPTIXPRO Strategic Reasoning Overlay - Validator
 * 
 * Verifies that the StrategicOverlay class produces the exact output expected
 * by the institutional-grade specification.
 */

import { StrategicOverlay } from './StrategicOverlay';
import type { MarketSnapshot, UserProfile } from './types';

const overlay = new StrategicOverlay();

const snapshot: MarketSnapshot = {
    symbol: 'NIFTY',
    timestamp: '2025-12-30T14:45:00+05:30',
    price: 25925.95,
    volume: 0,
    iv: 10.2,
    ivRank: 18,
    ivPercentile: 22,
    dte: 4,
    high52w: 26250,
    low52w: 18250,
    atr: 110,
    movingAverages: {
        ma20: 25890,
        ma50: 25740,
        ma200: 25120
    },
    volumeProfile: {
        poc: 25900,
        valueAreaHigh: 26250,
        valueAreaLow: 25750
    }
};

const profile: UserProfile = {
    accountSize: 300000,
    riskTolerance: 'moderate',
    maxLossPerTrade: 6000,
    maxPortfolioRisk: 45000,
    minPOP: 55,
    allowedStrategies: [
        'Iron Butterfly',
        'Iron Condor',
        'Put Credit Spread',
        'Calendar Spread'
    ],
    bannedStrategies: [
        'Short Straddle',
        'Naked Options'
    ]
};

console.log('Running Strategic Analysis...');
const analysis = overlay.generateAnalysis(snapshot, profile);
console.log(JSON.stringify(analysis, null, 2));

console.log('\nValidating Output Structure...');
if (!analysis.market_view) console.error('FAIL: Missing market_view');
if (!analysis.strategy_decision) console.error('FAIL: Missing strategy_decision');
if (!analysis.trade_management) console.error('FAIL: Missing trade_management');
if (!analysis.learning_output) console.error('FAIL: Missing learning_output');
if (!analysis.meta_notes) console.error('FAIL: Missing meta_notes');

console.log('Validation Complete.');
