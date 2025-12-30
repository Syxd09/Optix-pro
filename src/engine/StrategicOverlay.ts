/**
 * OPTIXPRO Strategic Reasoning Overlay
 * 
 * Acts as the strategic layer on top of the deterministic engine.
 * strictly conforms to the "Strategic Reasoning Overlay" output format.
 * 
 * - Validates suitability
 * - Re-ranks strategies
 * - Adds human-readable rationale
 * - Enforces capital preservation
 */

import { OptixProEngine } from './index';
import type {
    MarketSnapshot,
    UserProfile,
    Trade,
    TradeLifecycle,
    StrategicReasoningOutput,
    RegimeOutput,
    StrategyRecommendations,
    TradeHealthCheck,
    TradeAutopsy,
    Strategy
} from './types';

export class StrategicOverlay {
    private engine: OptixProEngine;

    constructor() {
        this.engine = new OptixProEngine();
    }

    /**
     * Main entry point to generate the full strategic analysis
     */
    public generateAnalysis(
        snapshot: MarketSnapshot,
        profile: UserProfile,
        activeTrade?: Trade,
        completedTrade?: TradeLifecycle
    ): StrategicReasoningOutput {
        // 1. Get Deterministic Outputs
        const regime = this.engine.analyzeMarket(snapshot);
        const recommendations = this.engine.getRecommendations(snapshot, profile);

        // 2. Market Understanding (Step 1)
        const marketView = this.buildMarketView(regime, snapshot);

        // 3. Strategy Review (Step 2 & 3)
        const strategyDecision = this.buildStrategyDecision(recommendations, marketView, snapshot);

        // 4. Trade Management (Step 4)
        const tradeManagement = this.buildTradeManagement(activeTrade, snapshot, regime);

        // 5. Learning Output (Step 5)
        const learningOutput = this.buildLearningOutput(completedTrade);

        // 6. Meta Notes
        const metaNotes = this.buildMetaNotes(regime, snapshot, strategyDecision);

        return {
            market_view: marketView,
            strategy_decision: strategyDecision,
            trade_management: tradeManagement,
            learning_output: learningOutput,
            meta_notes: metaNotes
        };
    }

    private buildMarketView(regime: RegimeOutput, snapshot: MarketSnapshot): StrategicReasoningOutput['market_view'] {
        const r = regime.regime;

        // Refined logic for gamma risk
        const additionalReasons: string[] = [];
        if (snapshot.dte !== undefined && snapshot.dte <= 5) {
            additionalReasons.push(`Short DTE (${snapshot.dte} days) introduces elevated gamma risk`);
        }

        return {
            volatility_regime: r.volatility,
            structure: `${r.structure}_consolidation`, // Enhancing description
            direction: r.direction === 'neutral' ? 'neutral' : `slight_${r.direction}`,
            confidence: r.confidence,
            do_not_trade_reasons: [
                ...regime.doNotTradeConditions,
                ...additionalReasons
            ]
        };
    }

    private buildStrategyDecision(
        recommendations: StrategyRecommendations,
        marketView: StrategicReasoningOutput['market_view'],
        snapshot: MarketSnapshot
    ): StrategicReasoningOutput['strategy_decision'] {
        const { strategies } = recommendations;

        // Filter NO_TRADE
        const activeStrategies = strategies.filter(s => s.name !== 'NO_TRADE');
        const noTradeOption = strategies.find(s => s.name === 'NO_TRADE');

        const ranked = activeStrategies.map((s, i) => ({
            name: s.name,
            rank: i + 1,
            rationale: this.generateRationale(s, marketView, snapshot),
            risk_profile: 'defined_risk' as const, // All current strategies are defined risk
            invalidation_condition: this.generateInvalidation(s, snapshot)
        }));

        const rejected = [];
        // If we filtered out some strategies due to constraints in the engine, we might not see them here
        // But we can synthesize rejections for strategies we know exist but aren't recommended
        // For now, let's list strategies that ranked low (conceptual rejection logic)
        // or if we forced NO_TRADE.

        if (activeStrategies.length === 0 && noTradeOption) {
            return {
                recommended_action: 'no_trade',
                ranked_strategies: [],
                rejected_strategies: [],
                rationale: noTradeOption.description
            };
        }

        // Logic to determine action
        const action = marketView.do_not_trade_reasons.length > 0 && marketView.confidence < 0.6
            ? 'no_trade'
            : 'trade';

        return {
            recommended_action: action,
            ranked_strategies: ranked,
            rejected_strategies: [], // Populated by advanced logic or if we specifically tracked dropped candidates
            rationale: `Market is ${marketView.structure} in a ${marketView.volatility_regime} IV environment. ${ranked[0]?.rationale || ''}`
        };
    }

    private generateRationale(strategy: Strategy, marketView: any, snapshot: MarketSnapshot): string {
        if (strategy.name === 'Iron Condor') {
            return `Aligned with ${marketView.structure}. Short strikes placed at value area boundaries to harvest theta with defined risk.`;
        }
        if (strategy.name === 'Put Credit Spread') {
            return `Capitalizes on structural support and ${marketView.direction} bias. Defined downside risk.`;
        }
        if (strategy.name === 'Iron Butterfly') {
            return `Optimal for ${marketView.volatility_regime} IV and range-bound structure. Max profit at POC.`;
        }
        return strategy.description;
    }

    private generateInvalidation(strategy: Strategy, snapshot: MarketSnapshot): string {
        if (strategy.name === 'Iron Condor' || strategy.name === 'Iron Butterfly') {
            const wing = strategy.legs.find(l => l.action === 'BUY' && l.type === 'CALL');
            const lowWing = strategy.legs.find(l => l.action === 'BUY' && l.type === 'PUT');
            return `Sustained price breach below ${lowWing?.strike} or above ${wing?.strike}`;
        }
        if (strategy.name === 'Put Credit Spread') {
            const shortStrike = strategy.legs.find(l => l.action === 'SELL')?.strike;
            return `Daily close below short strike (${shortStrike})`;
        }
        return 'Thesis invalidation';
    }

    private buildTradeManagement(
        activeTrade: Trade | undefined,
        snapshot: MarketSnapshot,
        regime: RegimeOutput
    ): StrategicReasoningOutput['trade_management'] {
        if (!activeTrade) {
            return {
                status: 'not_applicable',
                recommended_action: 'none',
                urgency: 'low',
                reason: 'No active trade provided for monitoring.'
            };
        }

        const health = this.engine.monitorTrade(activeTrade, snapshot, regime.regime);

        return {
            status: health.tradeHealth === 'thesis-broken' ? 'broken' :
                health.tradeHealth === 'critical' ? 'stressed' : 'healthy',
            recommended_action: health.recommendedAction === 'roll' ? 'adjust' : health.recommendedAction, // Mapping 'roll' to 'adjust' if needed, or update type
            urgency: health.urgency,
            reason: health.reason
        };
    }

    private buildLearningOutput(completedTrade?: TradeLifecycle): StrategicReasoningOutput['learning_output'] {
        if (!completedTrade) {
            return {
                lesson: '',
                confidence_error: 0.0,
                repeat_strategy: false
            };
        }

        const autopsy = this.engine.analyzeTrade(completedTrade);

        return {
            lesson: autopsy.lesson,
            confidence_error: autopsy.confidenceError,
            repeat_strategy: autopsy.shouldRepeatStrategy
        };
    }

    private buildMetaNotes(
        regime: RegimeOutput,
        snapshot: MarketSnapshot,
        strategyDecision: StrategicReasoningOutput['strategy_decision']
    ): StrategicReasoningOutput['meta_notes'] {
        const risks: string[] = [];

        // Contextual risks
        if (snapshot.dte !== undefined && snapshot.dte < 5) {
            risks.push('Gamma risk increases sharply with short DTE.');
        }
        const distToHigh = Math.abs((snapshot.high52w - snapshot.price) / snapshot.price);
        if (distToHigh < 0.01) {
            risks.push('Price is near 52-week high, raising breakout risk.');
        }

        return {
            contextual_risks: risks,
            uncertainty_disclosure: `Regime confidence is ${regime.regime.confidence.toFixed(2)}, execution variance depends on slippage and timing.`
        };
    }
}
