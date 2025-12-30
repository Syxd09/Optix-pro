/**
 * OPTIXPRO Reasoning Engine - Main Interface
 * 
 * Unified interface for all reasoning engine operations
 */

import { RegimeAnalyzer } from './regimeAnalyzer';
import { StrategyGenerator } from './strategyGenerator';
import { TradeMonitor } from './tradeMonitor';
import { TradeAnalyzer } from './tradeAnalyzer';

import type {
    MarketSnapshot,
    UserProfile,
    RegimeOutput,
    StrategyRecommendations,
    Trade,
    TradeHealthCheck,
    TradeAutopsy,
    RegimeAnalysis
} from './types';

/**
 * Main reasoning engine class
 * Orchestrates all decision-making components
 */
export class OptixProEngine {
    private regimeAnalyzer: RegimeAnalyzer;
    private strategyGenerator: StrategyGenerator;
    private tradeMonitor: TradeMonitor;
    private tradeAnalyzer: TradeAnalyzer;

    constructor() {
        this.regimeAnalyzer = new RegimeAnalyzer();
        this.strategyGenerator = new StrategyGenerator();
        this.tradeMonitor = new TradeMonitor();
        this.tradeAnalyzer = new TradeAnalyzer();
    }

    /**
     * Analyzes market snapshot and returns regime classification
     * 
     * @param snapshot Market data
     * @returns Regime analysis with levels and conditions
     */
    public analyzeMarket(snapshot: MarketSnapshot): RegimeOutput {
        return this.regimeAnalyzer.analyze(snapshot);
    }

    /**
     * Generates strategy recommendations based on market and constraints
     * 
     * @param snapshot Current market data
     * @param regime Market regime analysis
     * @param profile User constraints and preferences
     * @returns Ranked list of strategy recommendations
     */
    public generateStrategies(
        snapshot: MarketSnapshot,
        regime: RegimeOutput,
        profile: UserProfile
    ): StrategyRecommendations {
        return this.strategyGenerator.generate(snapshot, regime, profile);
    }

    /**
     * Monitors active trade and recommends actions
     * 
     * @param trade Active trade to monitor
     * @param currentSnapshot Current market state
     * @param currentRegime Current market regime
     * @returns Health check with recommended action
     */
    public monitorTrade(
        trade: Trade,
        currentSnapshot: MarketSnapshot,
        currentRegime: RegimeAnalysis
    ): TradeHealthCheck {
        return this.tradeMonitor.monitor(trade, currentSnapshot, currentRegime);
    }

    /**
     * Performs post-trade analysis to extract lessons
     * 
     * @param lifecycle Complete trade lifecycle data
     * @returns Trade autopsy with lessons and recommendations
     */
    public analyzeTrade(lifecycle: any): TradeAutopsy {
        return this.tradeAnalyzer.analyze(lifecycle);
    }

    /**
     * Complete workflow: Market -> Regime -> Strategies
     * Convenience method that combines market analysis and strategy generation
     * 
     * @param snapshot Market data
     * @param profile User constraints
     * @returns Strategy recommendations with market context
     */
    public getRecommendations(
        snapshot: MarketSnapshot,
        profile: UserProfile
    ): StrategyRecommendations {
        // Step 1: Analyze market regime
        const regime = this.analyzeMarket(snapshot);

        // Step 2: Generate strategies based on regime
        const strategies = this.generateStrategies(snapshot, regime, profile);

        return strategies;
    }
}

// Export types for external use
export type {
    MarketSnapshot,
    UserProfile,
    RegimeOutput,
    StrategyRecommendations,
    Strategy,
    Trade,
    TradeHealthCheck,
    TradeAutopsy,
    RegimeAnalysis,
    MarketLevels,
    TradeLeg
} from './types';
