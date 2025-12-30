/**
 * OPTIXPRO Reasoning Engine - Strategy Generator
 * 
 * Generates optimal options strategies based on:
 * - Current market regime
 * - User constraints
 * - Risk/reward parameters
 * 
 * Always includes NO_TRADE option when conditions are weak
 */

import type {
    MarketSnapshot,
    RegimeOutput,
    Strategy,
    StrategyRecommendations,
    UserProfile,
    TradeLeg
} from './types';

export class StrategyGenerator {
    /**
     * Validates user profile constraints
     */
    private validateUserProfile(profile: UserProfile): void {
        if (!profile.riskTolerance) {
            throw new Error('Missing required field: riskTolerance');
        }
        if (profile.maxLossPerTrade === undefined) {
            throw new Error('Missing required field: maxLossPerTrade');
        }
        if (profile.accountSize === undefined) {
            throw new Error('Missing required field: accountSize');
        }
    }

    /**
     * Generates Iron Butterfly strategy
     * Ideal for: Low IV, range-bound markets
     */
    private generateIronButterfly(
        snapshot: MarketSnapshot,
        regime: RegimeOutput
    ): Strategy | null {
        const { price } = snapshot;
        const { volatility, structure } = regime.regime;

        // Only valid in low IV, range-bound markets
        if (volatility !== 'low' || structure !== 'range-bound') {
            return null;
        }

        // Round to nearest 50
        const atmStrike = Math.round(price / 50) * 50;
        const lowerStrike = atmStrike - 100;
        const upperStrike = atmStrike + 100;

        // Estimate premiums (simplified - real pricing would use Black-Scholes)
        const atmCallPremium = price * (snapshot.iv / 100) * 0.4;
        const atmPutPremium = price * (snapshot.iv / 100) * 0.4;
        const otmCallPremium = price * (snapshot.iv / 100) * 0.25;
        const otmPutPremium = price * (snapshot.iv / 100) * 0.25;

        const legs: TradeLeg[] = [
            {
                action: 'BUY',
                type: 'PUT',
                strike: lowerStrike,
                quantity: 1,
                premium: otmPutPremium
            },
            {
                action: 'SELL',
                type: 'PUT',
                strike: atmStrike,
                quantity: 1,
                premium: atmPutPremium
            },
            {
                action: 'SELL',
                type: 'CALL',
                strike: atmStrike,
                quantity: 1,
                premium: atmCallPremium
            },
            {
                action: 'BUY',
                type: 'CALL',
                strike: upperStrike,
                quantity: 1,
                premium: otmCallPremium
            }
        ];

        const credit =
            atmCallPremium + atmPutPremium - otmCallPremium - otmPutPremium;
        const maxProfit = credit;
        const maxLoss = 100 - credit;

        return {
            name: 'Iron Butterfly',
            family: 'Neutral / Income',
            description: `Optimal for low IV regime with range-bound structure. Maximum profit at ${atmStrike} (current POC). Defined risk with favorable theta decay. Target 50% profit.`,
            maxProfit: Math.round(maxProfit * 100) / 100,
            maxLoss: Math.round(maxLoss * 100) / 100,
            breakeven: [atmStrike - credit, atmStrike + credit],
            pop: 58, // Simplified - real calculation would use delta
            riskLevel: 'low',
            legs,
            invalidWhen: [
                'IV Rank > 30',
                'Market structure is not range-bound',
                'Price moves > 2% from ATM strike'
            ],
            idealWhen: [
                'IV Rank < 20',
                'Strong range-bound structure',
                'Price near POC',
                'No major events in DTE window'
            ]
        };
    }

    /**
     * Generates Put Credit Spread
     * Ideal for: Bullish bias, defined risk
     */
    private generatePutCreditSpread(
        snapshot: MarketSnapshot,
        regime: RegimeOutput
    ): Strategy | null {
        const { price } = snapshot;
        const { direction, structure } = regime.regime;

        // Only valid with bullish bias
        if (direction === 'bearish') {
            return null;
        }

        // Find first support level
        const supportLevel = regime.levels.support[0] || price * 0.98;

        // Short strike just below support
        const shortStrike = Math.round(supportLevel / 50) * 50;
        const longStrike = shortStrike - 50;

        // Estimate premiums
        const shortPutPremium = price * (snapshot.iv / 100) * 0.35;
        const longPutPremium = price * (snapshot.iv / 100) * 0.28;

        const legs: TradeLeg[] = [
            {
                action: 'SELL',
                type: 'PUT',
                strike: shortStrike,
                quantity: 1,
                premium: shortPutPremium
            },
            {
                action: 'BUY',
                type: 'PUT',
                strike: longStrike,
                quantity: 1,
                premium: longPutPremium
            }
        ];

        const credit = shortPutPremium - longPutPremium;
        const maxProfit = credit;
        const maxLoss = 50 - credit;

        return {
            name: 'Put Credit Spread',
            family: 'Bullish / Income',
            description: `Aligned with ${direction} bias and support at ${supportLevel.toFixed(2)}. Collect theta with defined risk. Short strike below key support.`,
            maxProfit: Math.round(maxProfit * 100) / 100,
            maxLoss: Math.round(maxLoss * 100) / 100,
            breakeven: [shortStrike - credit],
            pop: 72,
            riskLevel: 'low',
            legs,
            invalidWhen: [
                'Directional bias turns bearish',
                'Price breaks below short strike',
                'Support level violated'
            ],
            idealWhen: [
                'Bullish or neutral bias',
                'Strong support level identified',
                'IV Rank < 50'
            ]
        };
    }

    /**
     * Generates Calendar Spread
     * Ideal for: Event volatility plays
     */
    private generateCalendarSpread(
        snapshot: MarketSnapshot,
        regime: RegimeOutput
    ): Strategy | null {
        const { price, dte } = snapshot;

        // Need sufficient time for calendar spread
        if (!dte || dte < 14) {
            return null;
        }

        const atmStrike = Math.round(price / 50) * 50;

        // Simplified premium estimates
        const frontMonthPremium = price * (snapshot.iv / 100) * 0.4;
        const backMonthPremium = price * (snapshot.iv / 100) * 0.6;

        const legs: TradeLeg[] = [
            {
                action: 'SELL',
                type: 'CALL',
                strike: atmStrike,
                quantity: 1,
                premium: frontMonthPremium
            },
            {
                action: 'BUY',
                type: 'CALL',
                strike: atmStrike,
                quantity: 1,
                premium: backMonthPremium
            }
        ];

        const debit = backMonthPremium - frontMonthPremium;
        const maxProfit = debit * 1.5; // Simplified estimate
        const maxLoss = debit;

        return {
            name: 'Calendar Spread',
            family: 'Neutral / Volatility',
            description: `Position for IV expansion around upcoming event. Long back-month vega, short front-month theta. Profits from volatility differential.`,
            maxProfit: Math.round(maxProfit * 100) / 100,
            maxLoss: Math.round(maxLoss * 100) / 100,
            breakeven: [atmStrike - debit * 0.5, atmStrike + debit * 0.5],
            pop: 55,
            riskLevel: 'medium',
            legs,
            invalidWhen: [
                'Large directional move (> 5%)',
                'IV collapses before event',
                'Less than 7 DTE on front month'
            ],
            idealWhen: [
                'Known event in 7-14 days',
                'IV expected to expand',
                'Price stable near ATM strike'
            ]
        };
    }

    /**
     * Generates Iron Condor
     * Ideal for: Low IV, range-bound, wider range than butterfly
     */
    private generateIronCondor(
        snapshot: MarketSnapshot,
        regime: RegimeOutput
    ): Strategy | null {
        const { price } = snapshot;
        const { volatility, structure } = regime.regime;

        // Only valid in low-normal IV, range-bound markets
        if (volatility === 'extreme' || structure === 'choppy') {
            return null;
        }

        const atmStrike = Math.round(price / 50) * 50;

        // Wider wings than butterfly
        const shortPutStrike = atmStrike - 100;
        const longPutStrike = atmStrike - 150;
        const shortCallStrike = atmStrike + 100;
        const longCallStrike = atmStrike + 150;

        // Estimate premiums
        const ivFactor = snapshot.iv / 100;
        const legs: TradeLeg[] = [
            {
                action: 'BUY',
                type: 'PUT',
                strike: longPutStrike,
                quantity: 1,
                premium: price * ivFactor * 0.2
            },
            {
                action: 'SELL',
                type: 'PUT',
                strike: shortPutStrike,
                quantity: 1,
                premium: price * ivFactor * 0.32
            },
            {
                action: 'SELL',
                type: 'CALL',
                strike: shortCallStrike,
                quantity: 1,
                premium: price * ivFactor * 0.32
            },
            {
                action: 'BUY',
                type: 'CALL',
                strike: longCallStrike,
                quantity: 1,
                premium: price * ivFactor * 0.2
            }
        ];

        const credit = (legs[1].premium + legs[2].premium) - (legs[0].premium + legs[3].premium);
        const maxProfit = credit;
        const maxLoss = 50 - credit;

        return {
            name: 'Iron Condor',
            family: 'Neutral / Income',
            description: `Wider range than butterfly for stable range-bound market. Profit zone: ${shortPutStrike} to ${shortCallStrike}. High probability of profit with defined risk.`,
            maxProfit: Math.round(maxProfit * 100) / 100,
            maxLoss: Math.round(maxLoss * 100) / 100,
            breakeven: [shortPutStrike - credit, shortCallStrike + credit],
            pop: 68,
            riskLevel: 'low',
            legs,
            invalidWhen: [
                'IV Rank > 50',
                'Market becomes choppy',
                'Expected move > wing width'
            ],
            idealWhen: [
                'Low to normal IV',
                'Range-bound structure',
                'No major catalysts in DTE window'
            ]
        };
    }

    /**
     * NO_TRADE strategy - always an option
     */
    private generateNoTrade(reason: string): Strategy {
        return {
            name: 'NO_TRADE',
            family: 'Capital Preservation',
            description: `Recommended to stay out of the market. Reason: ${reason}`,
            maxProfit: 0,
            maxLoss: 0,
            breakeven: [],
            pop: 100,
            riskLevel: 'low',
            legs: [],
            invalidWhen: [],
            idealWhen: ['Market conditions unclear', 'High uncertainty', 'Low confidence regime']
        };
    }

    /**
     * Filters strategies based on user constraints
     */
    private applyConstraints(
        strategies: Strategy[],
        profile: UserProfile
    ): { filtered: Strategy[]; applied: string[] } {
        const applied: string[] = [];
        let filtered = strategies;

        // Filter by max loss constraint
        filtered = filtered.filter(s => {
            if (s.maxLoss > profile.maxLossPerTrade) {
                applied.push(`Removed ${s.name}: max loss exceeds limit`);
                return false;
            }
            return true;
        });

        // Filter by min POP constraint
        if (profile.minPOP) {
            filtered = filtered.filter(s => {
                if (s.pop < profile.minPOP) {
                    applied.push(`Removed ${s.name}: POP below minimum`);
                    return false;
                }
                return true;
            });
        }

        // Filter by allowed/banned strategies
        if (profile.allowedStrategies && profile.allowedStrategies.length > 0) {
            filtered = filtered.filter(s => {
                if (!profile.allowedStrategies.includes(s.name)) {
                    applied.push(`Removed ${s.name}: not in allowed list`);
                    return false;
                }
                return true;
            });
        }

        if (profile.bannedStrategies && profile.bannedStrategies.length > 0) {
            filtered = filtered.filter(s => {
                if (profile.bannedStrategies.includes(s.name)) {
                    applied.push(`Removed ${s.name}: in banned list`);
                    return false;
                }
                return true;
            });
        }

        return { filtered, applied };
    }

    /**
     * Main strategy generation method
     */
    public generate(
        snapshot: MarketSnapshot,
        regime: RegimeOutput,
        profile: UserProfile
    ): StrategyRecommendations {
        // Validate inputs
        this.validateUserProfile(profile);

        const candidates: Strategy[] = [];

        // Generate all possible strategies
        const ironButterfly = this.generateIronButterfly(snapshot, regime);
        if (ironButterfly) candidates.push(ironButterfly);

        const putCreditSpread = this.generatePutCreditSpread(snapshot, regime);
        if (putCreditSpread) candidates.push(putCreditSpread);

        const calendarSpread = this.generateCalendarSpread(snapshot, regime);
        if (calendarSpread) candidates.push(calendarSpread);

        const ironCondor = this.generateIronCondor(snapshot, regime);
        if (ironCondor) candidates.push(ironCondor);

        // Apply user constraints
        const { filtered, applied } = this.applyConstraints(candidates, profile);

        // Check if NO_TRADE should be recommended
        const shouldNoTrade =
            filtered.length === 0 ||
            regime.doNotTradeConditions.length > 0 ||
            regime.regime.confidence < 0.6;

        if (shouldNoTrade) {
            const reason =
                regime.doNotTradeConditions[0] ||
                'Low confidence in market regime' ||
                'No suitable strategies available';
            filtered.unshift(this.generateNoTrade(reason));
        }

        // Rank strategies (NO_TRADE always first if present)
        const ranked = filtered.map((s, i) => ({
            ...s,
            rank: s.name === 'NO_TRADE' ? 0 : i + 1
        }));

        // Sort by rank, take top 5
        const topStrategies = ranked
            .sort((a, b) => {
                if (a.name === 'NO_TRADE') return -1;
                if (b.name === 'NO_TRADE') return 1;
                return b.pop - a.pop; // Sort by POP descending
            })
            .slice(0, 5);

        return {
            strategies: topStrategies,
            marketContext: regime,
            timestamp: new Date().toISOString(),
            constraintsApplied: applied
        };
    }
}
