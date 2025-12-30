/**
 * OPTIXPRO Reasoning Engine - Trade Monitor
 * 
 * Monitors active trades and recommends actions:
 * - Detects thesis breaks
 * - Identifies breach conditions
 * - Calculates urgency levels
 * - Recommends adjustments
 * 
 * Primary goal: PROTECT CAPITAL
 */

import type {
    Trade,
    MarketSnapshot,
    TradeHealthCheck,
    RegimeAnalysis
} from './types';

export class TradeMonitor {
    /**
     * Validates trade object
     */
    private validateTrade(trade: Trade): void {
        if (!trade.id) throw new Error('Missing trade.id');
        if (!trade.strategy) throw new Error('Missing trade.strategy');
        if (trade.maxLoss === undefined) throw new Error('Missing trade.maxLoss');
        if (!trade.entryRegime) throw new Error('Missing trade.entryRegime');
    }

    /**
     * Calculates current P&L percentage
     */
    private calculatePnLPercent(trade: Trade): number {
        if (trade.maxLoss === 0) return 0;
        return (trade.currentPnL / trade.maxLoss) * 100;
    }

    /**
     * Detects if entry thesis has been broken
     */
    private detectThesisBreak(
        trade: Trade,
        currentSnapshot: MarketSnapshot,
        currentRegime: RegimeAnalysis
    ): { broken: boolean; reason: string } {
        const entryRegime = trade.entryRegime;

        // Volatility regime changed significantly
        if (entryRegime.volatility !== currentRegime.volatility) {
            // Low -> High/Extreme is critical
            if (
                entryRegime.volatility === 'low' &&
                (currentRegime.volatility === 'high' || currentRegime.volatility === 'extreme')
            ) {
                return {
                    broken: true,
                    reason: `Volatility regime changed from ${entryRegime.volatility} to ${currentRegime.volatility}`
                };
            }
        }

        // Market structure changed
        if (entryRegime.structure !== currentRegime.structure) {
            // Range-bound -> Trending is a thesis break for neutral strategies
            if (
                entryRegime.structure === 'range-bound' &&
                currentRegime.structure.startsWith('trending')
            ) {
                return {
                    broken: true,
                    reason: `Market structure changed from range-bound to ${currentRegime.structure}`
                };
            }
        }

        // Direction flipped
        if (entryRegime.direction !== currentRegime.direction) {
            // Bullish -> Bearish or vice versa
            if (
                (entryRegime.direction === 'bullish' && currentRegime.direction === 'bearish') ||
                (entryRegime.direction === 'bearish' && currentRegime.direction === 'bullish')
            ) {
                return {
                    broken: true,
                    reason: `Directional thesis flipped from ${entryRegime.direction} to ${currentRegime.direction}`
                };
            }
        }

        // Price moved beyond breakeven
        const breakevenBreached = trade.breakeven.some(be => {
            if (trade.entryPrice < be && currentSnapshot.price > be) return true;
            if (trade.entryPrice > be && currentSnapshot.price < be) return true;
            return false;
        });

        if (breakevenBreached) {
            return {
                broken: true,
                reason: 'Price breached breakeven level'
            };
        }

        return { broken: false, reason: '' };
    }

    /**
     * Checks for breach conditions (max loss approaching, etc.)
     */
    private detectBreach(trade: Trade): { detected: boolean; severity: number; reason: string } {
        const pnlPercent = this.calculatePnLPercent(trade);

        // Critical: losing > 80% of max loss
        if (pnlPercent < -80) {
            return {
                detected: true,
                severity: 1.0,
                reason: `Current loss (${pnlPercent.toFixed(1)}%) approaching max loss`
            };
        }

        // High: losing > 50% of max loss
        if (pnlPercent < -50) {
            return {
                detected: true,
                severity: 0.75,
                reason: `Current loss (${pnlPercent.toFixed(1)}%) exceeds 50% of max loss`
            };
        }

        // Medium: losing > 25% of max loss
        if (pnlPercent < -25) {
            return {
                detected: true,
                severity: 0.5,
                reason: `Current loss (${pnlPercent.toFixed(1)}%) exceeds 25% of max loss`
            };
        }

        // Expiration risk: < 3 DTE and losing money
        if (trade.daysRemaining < 3 && trade.currentPnL < 0) {
            return {
                detected: true,
                severity: 0.6,
                reason: `Less than 3 days to expiration with negative P&L`
            };
        }

        return { detected: false, severity: 0, reason: '' };
    }

    /**
     * Recommends action based on trade health
     */
    private recommendAction(
        trade: Trade,
        thesisBreak: { broken: boolean; reason: string },
        breach: { detected: boolean; severity: number; reason: string }
    ): {
        action: TradeHealthCheck['recommendedAction'];
        urgency: TradeHealthCheck['urgency'];
    } {
        // Thesis broken = close immediately
        if (thesisBreak.broken) {
            return { action: 'close', urgency: 'immediate' };
        }

        // Critical breach = close or adjust urgently
        if (breach.detected && breach.severity >= 0.75) {
            return { action: 'close', urgency: 'immediate' };
        }

        // Medium breach = consider adjustment
        if (breach.detected && breach.severity >= 0.5) {
            return { action: 'adjust', urgency: 'high' };
        }

        // Light breach = monitor cautiously
        if (breach.detected && breach.severity >= 0.25) {
            return { action: 'adjust', urgency: 'medium' };
        }

        // Take profit at 50%+ of max profit
        const pnlPercent = this.calculatePnLPercent(trade);
        if (pnlPercent > 50) {
            return { action: 'close', urgency: 'low' };
        }

        // Early expiration with profit
        if (trade.daysRemaining < 5 && trade.currentPnL > 0) {
            return { action: 'close', urgency: 'low' };
        }

        // All good - hold
        return { action: 'hold', urgency: 'low' };
    }

    /**
     * Determines overall trade health
     */
    private assessHealth(
        trade: Trade,
        thesisBreak: { broken: boolean; reason: string },
        breach: { detected: boolean; severity: number; reason: string }
    ): TradeHealthCheck['tradeHealth'] {
        if (thesisBreak.broken) return 'thesis-broken';
        if (breach.detected && breach.severity >= 0.75) return 'critical';
        if (breach.detected && breach.severity >= 0.5) return 'caution';
        return 'healthy';
    }

    /**
     * Main monitoring method
     */
    public monitor(
        trade: Trade,
        currentSnapshot: MarketSnapshot,
        currentRegime: RegimeAnalysis
    ): TradeHealthCheck {
        // Validate input
        this.validateTrade(trade);

        // Detect thesis break
        const thesisBreak = this.detectThesisBreak(trade, currentSnapshot, currentRegime);

        // Detect breach conditions
        const breach = this.detectBreach(trade);

        // Recommend action
        const { action, urgency } = this.recommendAction(trade, thesisBreak, breach);

        // Assess overall health
        const health = this.assessHealth(trade, thesisBreak, breach);

        // Build reason
        let reason = '';
        if (thesisBreak.broken) {
            reason = `THESIS BROKEN: ${thesisBreak.reason}`;
        } else if (breach.detected) {
            reason = breach.reason;
        } else if (action === 'close' && urgency === 'low') {
            reason = 'Trade target achieved - consider taking profits';
        } else {
            reason = 'Trade performing as expected';
        }

        // Calculate metrics
        const pnlPercent = this.calculatePnLPercent(trade);

        return {
            tradeHealth: health,
            breachDetected: breach.detected || thesisBreak.broken,
            recommendedAction: action,
            urgency,
            reason,
            currentMetrics: {
                pnlPercent,
                deltaChange: 0, // Would need Greeks calculation
                ivChange: 0, // Would need historical IV tracking
                daysToExpiration: trade.daysRemaining
            }
        };
    }
}
