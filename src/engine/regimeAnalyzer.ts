/**
 * OPTIXPRO Reasoning Engine - Market Regime Analyzer
 * 
 * Analyzes market conditions to determine:
 * - Volatility regime (low, normal, high, extreme)
 * - Market structure (trending, range-bound, choppy)
 * - Directional bias (bullish, bearish, neutral)
 * - Key support/resistance levels
 * - Do-not-trade conditions
 */

import type {
    MarketSnapshot,
    RegimeAnalysis,
    MarketLevels,
    RegimeOutput,
    ValidationResult
} from './types';

export class RegimeAnalyzer {
    /**
     * Validates market snapshot has all required fields
     */
    private validateInput(snapshot: MarketSnapshot): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!snapshot.symbol) errors.push('Missing required field: symbol');
        if (snapshot.price === undefined) errors.push('Missing required field: price');
        if (snapshot.iv === undefined) errors.push('Missing required field: iv');
        if (snapshot.ivRank === undefined) errors.push('Missing required field: ivRank');
        if (snapshot.ivPercentile === undefined) errors.push('Missing required field: ivPercentile');

        // Validate ranges
        if (snapshot.ivRank < 0 || snapshot.ivRank > 100) {
            errors.push('ivRank must be between 0 and 100');
        }
        if (snapshot.ivPercentile < 0 || snapshot.ivPercentile > 100) {
            errors.push('ivPercentile must be between 0 and 100');
        }

        // Warnings for missing optional but useful data
        if (!snapshot.volumeProfile) {
            warnings.push('Volume profile data missing - levels may be less accurate');
        }
        if (!snapshot.movingAverages) {
            warnings.push('Moving averages missing - trend detection may be limited');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Determines volatility regime based on IV Rank and IV Percentile
     */
    private analyzeVolatility(snapshot: MarketSnapshot): {
        regime: RegimeAnalysis['volatility'];
        confidence: number;
    } {
        const { ivRank, ivPercentile } = snapshot;

        // Use both metrics for confidence
        const avgMetric = (ivRank + ivPercentile) / 2;

        if (avgMetric < 20) {
            return { regime: 'low', confidence: 1 - (avgMetric / 20) * 0.3 }; // 0.7-1.0
        } else if (avgMetric < 50) {
            return { regime: 'normal', confidence: 0.8 };
        } else if (avgMetric < 80) {
            return { regime: 'high', confidence: 0.85 };
        } else {
            return { regime: 'extreme', confidence: 0.9 + (avgMetric - 80) / 200 }; // 0.9-1.0
        }
    }

    /**
     * Determines market structure using price action and moving averages
     */
    private analyzeStructure(snapshot: MarketSnapshot): {
        structure: RegimeAnalysis['structure'];
        confidence: number;
    } {
        const { price, movingAverages, atr, high52w, low52w } = snapshot;

        if (!movingAverages) {
            // Fallback: use 52w high/low
            const range52w = high52w - low52w;
            const distanceFromHigh = high52w - price;
            const distanceFromLow = price - low52w;

            if (distanceFromHigh < range52w * 0.05) {
                return { structure: 'trending-up', confidence: 0.6 };
            } else if (distanceFromLow < range52w * 0.05) {
                return { structure: 'trending-down', confidence: 0.6 };
            } else {
                return { structure: 'range-bound', confidence: 0.5 };
            }
        }

        const { ma20, ma50, ma200 } = movingAverages;

        // Trending up: price > MA20 > MA50 > MA200
        if (price > ma20 && ma20 > ma50 && ma50 > ma200) {
            const separation = ((ma20 - ma200) / ma200) * 100;
            return {
                structure: 'trending-up',
                confidence: Math.min(0.95, 0.7 + separation * 0.05)
            };
        }

        // Trending down: price < MA20 < MA50 < MA200
        if (price < ma20 && ma20 < ma50 && ma50 < ma200) {
            const separation = ((ma200 - ma20) / ma200) * 100;
            return {
                structure: 'trending-down',
                confidence: Math.min(0.95, 0.7 + separation * 0.05)
            };
        }

        // Range-bound: MAs converging, low ATR
        const maRange = Math.max(ma20, ma50, ma200) - Math.min(ma20, ma50, ma200);
        const rangePercent = (maRange / price) * 100;

        if (rangePercent < 2) {
            return { structure: 'range-bound', confidence: 0.85 };
        }

        // Choppy: MAs crossed, no clear trend
        return { structure: 'choppy', confidence: 0.75 };
    }

    /**
     * Determines directional bias
     */
    private analyzeDirection(snapshot: MarketSnapshot): {
        direction: RegimeAnalysis['direction'];
        confidence: number;
    } {
        const { price, movingAverages, volumeProfile } = snapshot;

        if (!movingAverages) {
            return { direction: 'neutral', confidence: 0.5 };
        }

        const { ma20, ma50 } = movingAverages;

        // Strong bullish: price significantly above MA50
        if (price > ma50 * 1.02) {
            return { direction: 'bullish', confidence: 0.85 };
        }

        // Strong bearish: price significantly below MA50
        if (price < ma50 * 0.98) {
            return { direction: 'bearish', confidence: 0.85 };
        }

        // Slight bullish: price above MA20
        if (price > ma20) {
            return { direction: 'bullish', confidence: 0.65 };
        }

        // Slight bearish: price below MA20
        if (price < ma20) {
            return { direction: 'bearish', confidence: 0.65 };
        }

        // Neutral: price near MA20
        return { direction: 'neutral', confidence: 0.8 };
    }

    /**
     * Calculates support and resistance levels
     */
    private calculateLevels(snapshot: MarketSnapshot): MarketLevels {
        const { price, volumeProfile, movingAverages, high52w, low52w } = snapshot;

        const support: number[] = [];
        const resistance: number[] = [];

        // Add moving averages as levels
        if (movingAverages) {
            const { ma20, ma50, ma200 } = movingAverages;

            if (ma20 < price) support.push(ma20);
            else resistance.push(ma20);

            if (ma50 < price) support.push(ma50);
            else resistance.push(ma50);

            if (ma200 < price) support.push(ma200);
            else resistance.push(ma200);
        }

        // Add 52w high/low
        support.push(low52w);
        resistance.push(high52w);

        // Add volume profile levels
        const valueArea = {
            poc: volumeProfile?.poc || price,
            high: volumeProfile?.valueAreaHigh || price * 1.02,
            low: volumeProfile?.valueAreaLow || price * 0.98
        };

        if (valueArea.low < price) support.push(valueArea.low);
        if (valueArea.high > price) resistance.push(valueArea.high);

        // Sort and deduplicate
        const uniqueSupport = [...new Set(support)]
            .filter(s => s < price)
            .sort((a, b) => b - a) // Closest first
            .slice(0, 3);

        const uniqueResistance = [...new Set(resistance)]
            .filter(r => r > price)
            .sort((a, b) => a - b) // Closest first
            .slice(0, 3);

        return {
            support: uniqueSupport,
            resistance: uniqueResistance,
            valueArea
        };
    }

    /**
     * Checks for conditions that should prevent trading
     */
    private checkDoNotTradeConditions(snapshot: MarketSnapshot, regime: RegimeAnalysis): string[] {
        const conditions: string[] = [];

        // Extreme volatility - hard to price options
        if (regime.volatility === 'extreme') {
            conditions.push('Extreme volatility makes pricing unreliable');
        }

        // Choppy market - no clear direction
        if (regime.structure === 'choppy' && regime.confidence > 0.7) {
            conditions.push('Choppy market structure - high whipsaw risk');
        }

        // Low confidence in regime
        if (regime.confidence < 0.5) {
            conditions.push('Low confidence in regime classification - unclear market state');
        }

        // Approaching expiration with high IV
        if (snapshot.dte !== undefined && snapshot.dte < 3 && snapshot.ivRank > 70) {
            conditions.push('High IV near expiration - gamma risk too high');
        }

        // Price at extremes (within 1% of 52w high/low)
        const distanceFromHigh = ((snapshot.high52w - snapshot.price) / snapshot.high52w) * 100;
        const distanceFromLow = ((snapshot.price - snapshot.low52w) / snapshot.low52w) * 100;

        if (distanceFromHigh < 1) {
            conditions.push('Price at 52w high - mean reversion risk');
        }
        if (distanceFromLow < 1) {
            conditions.push('Price at 52w low - potential breakdown risk');
        }

        return conditions;
    }

    /**
     * Main analysis method
     */
    public analyze(snapshot: MarketSnapshot): RegimeOutput {
        // Validate input
        const validation = this.validateInput(snapshot);
        if (!validation.valid) {
            throw new Error(`Invalid market snapshot: ${validation.errors.join(', ')}`);
        }

        // Analyze components
        const { regime: volatility, confidence: volConfidence } = this.analyzeVolatility(snapshot);
        const { structure, confidence: structConfidence } = this.analyzeStructure(snapshot);
        const { direction, confidence: dirConfidence } = this.analyzeDirection(snapshot);

        // Overall confidence is the minimum of all components
        const overallConfidence = Math.min(volConfidence, structConfidence, dirConfidence);

        const regime: RegimeAnalysis = {
            volatility,
            structure,
            direction,
            confidence: Math.round(overallConfidence * 100) / 100 // Round to 2 decimals
        };

        // Calculate levels
        const levels = this.calculateLevels(snapshot);

        // Check do-not-trade conditions
        const doNotTradeConditions = this.checkDoNotTradeConditions(snapshot, regime);

        // Generate notes
        const notes = this.generateNotes(snapshot, regime, levels);

        return {
            regime,
            levels,
            doNotTradeConditions,
            notes
        };
    }

    /**
     * Generates human-readable notes about the analysis
     */
    private generateNotes(
        snapshot: MarketSnapshot,
        regime: RegimeAnalysis,
        levels: MarketLevels
    ): string {
        const parts: string[] = [];

        // Volatility context
        parts.push(
            `IV Rank ${snapshot.ivRank} indicates ${regime.volatility} volatility environment.`
        );

        // Structure context
        if (regime.structure === 'range-bound') {
            parts.push(
                `Price consolidating between ${levels.support[0]?.toFixed(2) || 'N/A'} and ${levels.resistance[0]?.toFixed(2) || 'N/A'
                }.`
            );
        } else if (regime.structure.startsWith('trending')) {
            parts.push(`Clear ${regime.structure} structure with ${regime.confidence} confidence.`);
        }

        // Direction context
        if (regime.direction !== 'neutral') {
            parts.push(`Directional bias is ${regime.direction}.`);
        }

        // Risk warning
        if (regime.confidence < 0.7) {
            parts.push('Low confidence - exercise caution.');
        }

        return parts.join(' ');
    }
}
