/**
 * OPTIXPRO Reasoning Engine - Trade Autopsy
 * 
 * Post-trade analysis to learn from outcomes:
 * - Classifies mistakes
 * - Extracts lessons
 * - Calculates confidence errors
 * - Determines if strategy should be repeated
 */

import type {
    Trade,
    TradeAutopsy,
    RegimeAnalysis,
    MarketSnapshot,
    TradeLifecycle
} from './types';

export class TradeAnalyzer {
    /**
     * Validates trade lifecycle data
     */
    private validateLifecycle(lifecycle: TradeLifecycle): void {
        if (!lifecycle.trade) throw new Error('Missing trade data');
        if (!lifecycle.entryRegime) throw new Error('Missing entry regime');
        if (!lifecycle.exitRegime) throw new Error('Missing exit regime');
        if (lifecycle.actualPnL === undefined) throw new Error('Missing actual P&L');
    }

    /**
     * Checks if regime analysis was correct
     */
    private analyzeRegimeAccuracy(lifecycle: TradeLifecycle): {
        correct: boolean;
        error: string;
    } {
        const { entryRegime, exitRegime, trade } = lifecycle;

        // If regime held throughout trade = correct
        if (
            entryRegime.volatility === exitRegime.volatility &&
            entryRegime.structure === exitRegime.structure &&
            entryRegime.direction === exitRegime.direction
        ) {
            return { correct: true, error: '' };
        }

        // Major regime change = misread
        if (
            entryRegime.volatility !== exitRegime.volatility &&
            Math.abs(entryRegime.confidence - exitRegime.confidence) > 0.3
        ) {
            return {
                correct: false,
                error: `Volatility regime shifted from ${entryRegime.volatility} to ${exitRegime.volatility}`
            };
        }

        if (entryRegime.structure !== exitRegime.structure) {
            return {
                correct: false,
                error: `Market structure changed from ${entryRegime.structure} to ${exitRegime.structure}`
            };
        }

        // Minor changes are acceptable
        return { correct: true, error: '' };
    }

    /**
     * Checks if strategy was suitable for the regime
     */
    private analyzeStrategySuitability(lifecycle: TradeLifecycle): {
        suitable: boolean;
        reason: string;
    } {
        const { trade, entryRegime, actualPnL } = lifecycle;

        // Low IV strategies (Iron Butterfly, Iron Condor) in high IV = unsuitable
        if (
            (trade.strategy === 'Iron Butterfly' || trade.strategy === 'Iron Condor') &&
            entryRegime.volatility === 'high'
        ) {
            return {
                suitable: false,
                reason: `${trade.strategy} unsuitable for high volatility environment`
            };
        }

        // Directional strategies against prevailing trend = unsuitable
        if (
            trade.strategy === 'Put Credit Spread' &&
            entryRegime.direction === 'bearish' &&
            actualPnL < 0
        ) {
            return {
                suitable: false,
                reason: 'Bullish strategy deployed in bearish environment'
            };
        }

        // If trade was profitable despite regime change = lucky, not suitable
        if (actualPnL > 0 && !this.analyzeRegimeAccuracy(lifecycle).correct) {
            return {
                suitable: false,
                reason: 'Profitable but regime analysis was incorrect - lucky outcome'
            };
        }

        return { suitable: true, reason: 'Strategy aligned with regime' };
    }

    /**
     * Analyzes adjustment timing
     */
    private analyzeAdjustmentTiming(lifecycle: TradeLifecycle): {
        timing: 'early' | 'late' | 'appropriate' | 'none';
        reason: string;
    } {
        const { adjustments, actualPnL } = lifecycle;

        if (adjustments.length === 0) {
            // No adjustments
            if (actualPnL < 0) {
                return {
                    timing: 'late',
                    reason: 'Should have adjusted but did not - loss incurred'
                };
            }
            return { timing: 'none', reason: 'No adjustment needed' };
        }

        // Check if adjusted too early (profitable position)
        const firstAdjustment = adjustments[0];
        if (actualPnL > 0 && adjustments.length > 2) {
            return {
                timing: 'early',
                reason: 'Multiple adjustments on profitable trade - over-managed'
            };
        }

        // Check if adjusted too late (large loss)
        const lossPercent = (actualPnL / lifecycle.trade.maxLoss) * 100;
        if (lossPercent < -75) {
            return {
                timing: 'late',
                reason: 'Adjustment came too late - significant loss already incurred'
            };
        }

        return { timing: 'appropriate', reason: 'Adjustment timing was reasonable' };
    }

    /**
     * Classifies the type of mistake (if any)
     */
    private classifyMistake(
        regimeAnalysis: { correct: boolean; error: string },
        suitabilityAnalysis: { suitable: boolean; reason: string },
        adjustmentAnalysis: { timing: 'early' | 'late' | 'appropriate' | 'none'; reason: string }
    ): TradeAutopsy['mistakeType'] {
        if (!regimeAnalysis.correct) {
            return 'regime-misread';
        }

        if (!suitabilityAnalysis.suitable) {
            return 'strategy-unsuitable';
        }

        if (adjustmentAnalysis.timing === 'late') {
            return 'late-adjustment';
        }

        if (adjustmentAnalysis.timing === 'early') {
            return 'early-adjustment';
        }

        return 'none';
    }

    /**
     * Extracts actionable lesson from the trade
     */
    private extractLesson(
        lifecycle: TradeLifecycle,
        mistakeType: TradeAutopsy['mistakeType'],
        regimeAnalysis: { correct: boolean; error: string },
        suitabilityAnalysis: { suitable: boolean; reason: string },
        adjustmentAnalysis: { timing: 'early' | 'late' | 'appropriate' | 'none'; reason: string }
    ): string {
        if (mistakeType === 'regime-misread') {
            return `Regime misread: ${regimeAnalysis.error}. Improve regime detection with additional indicators.`;
        }

        if (mistakeType === 'strategy-unsuitable') {
            return `Strategy selection error: ${suitabilityAnalysis.reason}. Ensure strategy aligns with regime.`;
        }

        if (mistakeType === 'late-adjustment') {
            return `Adjustment too late: ${adjustmentAnalysis.reason}. Set tighter stop-loss or thesis-break triggers.`;
        }

        if (mistakeType === 'early-adjustment') {
            return `Over-managed position: ${adjustmentAnalysis.reason}. Trust the thesis and avoid premature adjustments.`;
        }

        // No mistake - extract what went right
        if (lifecycle.actualPnL > 0) {
            return `Successful execution: Regime read correctly, strategy suitable, timing appropriate. Repeat this approach.`;
        } else {
            return `Minor loss within acceptable range. Execution was correct despite negative outcome.`;
        }
    }

    /**
     * Calculates confidence error (how wrong was our confidence estimate)
     */
    private calculateConfidenceError(lifecycle: TradeLifecycle): number {
        const { trade, actualPnL, entryRegime } = lifecycle;

        // Expected P&L based on POP
        const expectedPnL =
            (trade.maxProfit * (trade.pop / 100)) +
            (trade.maxLoss * ((100 - trade.pop) / 100) * -1);

        // Actual outcome
        const winProbability = actualPnL > 0 ? 1.0 : 0.0;

        // Confidence error = (actual - expected) / 100
        // Positive = we were too pessimistic
        // Negative = we were too optimistic
        const confidenceError = (winProbability - trade.pop / 100);

        // Weight by regime confidence
        return confidenceError * entryRegime.confidence;
    }

    /**
     * Determines if strategy should be repeated
     */
    private shouldRepeat(
        lifecycle: TradeLifecycle,
        mistakeType: TradeAutopsy['mistakeType'],
        suitabilityAnalysis: { suitable: boolean; reason: string }
    ): boolean {
        // Never repeat if strategy was unsuitable
        if (!suitabilityAnalysis.suitable) {
            return false;
        }

        // Don't repeat if regime was severely misread
        if (mistakeType === 'regime-misread') {
            return false;
        }

        // Repeat if profitable
        if (lifecycle.actualPnL > 0) {
            return true;
        }

        // Repeat if loss was < 50% of max loss (acceptable loss)
        const lossPercent = (lifecycle.actualPnL / lifecycle.trade.maxLoss) * 100;
        if (lossPercent > -50 && mistakeType === 'none') {
            return true;
        }

        return false;
    }

    /**
     * Main autopsy method
     */
    public analyze(lifecycle: TradeLifecycle): TradeAutopsy {
        // Validate input
        this.validateLifecycle(lifecycle);

        // Analyze components
        const regimeAnalysis = this.analyzeRegimeAccuracy(lifecycle);
        const suitabilityAnalysis = this.analyzeStrategySuitability(lifecycle);
        const adjustmentAnalysis = this.analyzeAdjustmentTiming(lifecycle);

        // Classify mistake
        const mistakeType = this.classifyMistake(
            regimeAnalysis,
            suitabilityAnalysis,
            adjustmentAnalysis
        );

        // Extract lesson
        const lesson = this.extractLesson(
            lifecycle,
            mistakeType,
            regimeAnalysis,
            suitabilityAnalysis,
            adjustmentAnalysis
        );

        // Calculate confidence error
        const confidenceError = this.calculateConfidenceError(lifecycle);

        // Determine if should repeat
        const shouldRepeatStrategy = this.shouldRepeat(
            lifecycle,
            mistakeType,
            suitabilityAnalysis
        );

        // Identify correct/incorrect decisions
        const correctDecisions: string[] = [];
        const incorrectDecisions: string[] = [];

        if (regimeAnalysis.correct) {
            correctDecisions.push('Regime analysis was accurate');
        } else {
            incorrectDecisions.push(`Regime misread: ${regimeAnalysis.error}`);
        }

        if (suitabilityAnalysis.suitable) {
            correctDecisions.push('Strategy selection was appropriate');
        } else {
            incorrectDecisions.push(`Strategy unsuitable: ${suitabilityAnalysis.reason}`);
        }

        if (adjustmentAnalysis.timing === 'appropriate' || adjustmentAnalysis.timing === 'none') {
            correctDecisions.push('Adjustment timing was correct');
        } else {
            incorrectDecisions.push(`Adjustment issue: ${adjustmentAnalysis.reason}`);
        }

        // Calculate hold time
        const holdTime = Math.round(
            (new Date(lifecycle.exitDate).getTime() - new Date(lifecycle.trade.entryDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
            mistakeType,
            lesson,
            shouldRepeatStrategy,
            confidenceError: Math.round(confidenceError * 100) / 100,
            actualPnL: lifecycle.actualPnL,
            expectedPnL:
                (lifecycle.trade.maxProfit * (lifecycle.trade.pop / 100)) +
                (lifecycle.trade.maxLoss * ((100 - lifecycle.trade.pop) / 100) * -1),
            holdTime,
            correctDecisions,
            incorrectDecisions
        };
    }
}
