/**
 * OPTIXPRO Reasoning Engine - Type Definitions
 * 
 * All input/output types for deterministic decision-making
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface MarketSnapshot {
  symbol: string;
  timestamp: string;
  price: number;
  volume: number;
  iv: number; // Implied Volatility
  ivRank: number; // 0-100
  ivPercentile: number; // 0-100
  dte: number; // Days to Expiration

  // Price action
  high52w: number;
  low52w: number;
  atr: number; // Average True Range

  // Technical levels
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };

  // Volume profile
  volumeProfile?: {
    poc: number; // Point of Control
    valueAreaHigh: number;
    valueAreaLow: number;
  };
}

export interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  maxLossPerTrade: number; // Absolute dollar amount
  maxPortfolioRisk: number; // Percentage
  allowedStrategies: string[]; // Whitelist
  bannedStrategies: string[]; // Blacklist
  minPOP: number; // Minimum Probability of Profit (%)
  accountSize: number;
}

export interface Trade {
  id: string;
  symbol: string;
  strategy: string;
  entryDate: string;
  entryPrice: number;
  expirationDate: string;
  legs: TradeLeg[];

  // Entry thesis
  entryRegime: RegimeAnalysis;
  maxLoss: number;
  maxProfit: number;
  breakeven: number[];
  pop: number; // Probability of Profit

  // Current state
  currentPrice: number;
  currentPnL: number;
  daysRemaining: number;
}

export interface TradeLeg {
  action: 'BUY' | 'SELL';
  type: 'CALL' | 'PUT';
  strike: number;
  quantity: number;
  premium: number;
  currentValue?: number;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface RegimeAnalysis {
  volatility: 'low' | 'normal' | 'high' | 'extreme';
  structure: 'trending-up' | 'trending-down' | 'range-bound' | 'choppy';
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0.0 - 1.0
}

export interface MarketLevels {
  support: number[];
  resistance: number[];
  valueArea: {
    high: number;
    low: number;
    poc: number;
  };
}

export interface RegimeOutput {
  regime: RegimeAnalysis;
  levels: MarketLevels;
  doNotTradeConditions: string[];
  notes: string;
}

export interface Strategy {
  name: string;
  family: string; // e.g., "Neutral / Income"
  description: string;

  // Risk/Reward
  maxProfit: number | 'unlimited';
  maxLoss: number;
  breakeven: number[];
  pop: number; // Probability of Profit
  riskLevel: 'low' | 'medium' | 'high';

  // Trade construction
  legs: TradeLeg[];

  // Conditions
  invalidWhen: string[]; // Conditions that invalidate this strategy
  idealWhen: string[]; // Ideal conditions for this strategy

  // Meta
  rank?: number;
}

export interface StrategyRecommendations {
  strategies: Strategy[];
  marketContext: RegimeOutput;
  timestamp: string;
  constraintsApplied: string[];
}

export interface TradeHealthCheck {
  tradeHealth: 'healthy' | 'caution' | 'critical' | 'thesis-broken';
  breachDetected: boolean;
  recommendedAction: 'hold' | 'adjust' | 'close' | 'roll';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  reason: string;

  // Additional context
  currentMetrics?: {
    pnlPercent: number;
    deltaChange: number;
    ivChange: number;
    daysToExpiration: number;
  };
}

export interface TradeAutopsy {
  mistakeType: 'regime-misread' | 'strategy-unsuitable' | 'late-adjustment' | 'early-adjustment' | 'none';
  lesson: string;
  shouldRepeatStrategy: boolean;
  confidenceError: number; // How wrong was the confidence estimate? (-1.0 to 1.0)

  // Performance metrics
  actualPnL: number;
  expectedPnL: number;
  holdTime: number; // days

  // What went right/wrong
  correctDecisions: string[];
  incorrectDecisions: string[];
}

export interface TradeLifecycle {
  trade: Trade;
  entrySnapshot: MarketSnapshot;
  exitSnapshot: MarketSnapshot;
  entryRegime: RegimeAnalysis;
  exitRegime: RegimeAnalysis;
  adjustments: Array<{
    date: string;
    action: string;
    reason: string;
  }>;
  exitReason: string;
  actualPnL: number;
  exitDate: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// STRATEGIC REASONING OVERLAY TYPES
// ============================================================================

export interface MarketView {
  volatility_regime: string;
  structure: string;
  direction: string;
  confidence: number;
  do_not_trade_reasons: string[];
}

export interface StrategyDecision {
  recommended_action: 'trade' | 'wait' | 'no_trade';
  ranked_strategies: Array<{
    name: string;
    rank: number;
    rationale: string;
    risk_profile: 'defined_risk' | 'undefined_risk';
    invalidation_condition: string;
  }>;
  rejected_strategies: Array<{
    name: string;
    reason: string;
  }>;
  rationale: string;
}

export interface TradeManagementDecision {
  status: 'not_applicable' | 'healthy' | 'stressed' | 'broken';
  recommended_action: 'hold' | 'adjust' | 'close' | 'none';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  reason: string;
}

export interface LearningOutput {
  lesson: string;
  confidence_error: number;
  repeat_strategy: boolean;
}

export interface MetaNotes {
  contextual_risks: string[];
  uncertainty_disclosure: string;
}

export interface StrategicReasoningOutput {
  market_view: MarketView;
  strategy_decision: StrategyDecision;
  trade_management: TradeManagementDecision;
  learning_output: LearningOutput;
  meta_notes: MetaNotes;
}
