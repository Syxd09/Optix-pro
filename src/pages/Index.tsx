import { Header } from "@/components/trading/Header";
import { MarketRegimeCard } from "@/components/trading/MarketRegimeCard";
import { ExpectedMoveCard } from "@/components/trading/ExpectedMoveCard";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { TradeLifecycleCard } from "@/components/trading/TradeLifecycleCard";
import { GreeksDisplay } from "@/components/trading/GreeksDisplay";

// Mock data for demonstration
const mockStrategies = [
  {
    rank: 1,
    name: "Iron Condor",
    family: "Neutral / Income",
    maxProfit: 285,
    maxLoss: 715,
    breakeven: [428.15, 456.85],
    pop: 68,
    riskLevel: "low" as const,
    description: "Defined-risk neutral strategy capitalizing on elevated IV rank and expected range-bound behavior. Optimal for current market regime.",
    legs: [
      { action: "SELL" as const, type: "PUT" as const, strike: 430, premium: 2.45 },
      { action: "BUY" as const, type: "PUT" as const, strike: 420, premium: 1.15 },
      { action: "SELL" as const, type: "CALL" as const, strike: 455, premium: 2.30 },
      { action: "BUY" as const, type: "CALL" as const, strike: 465, premium: 0.75 },
    ],
  },
  {
    rank: 2,
    name: "Put Credit Spread",
    family: "Bullish / Income",
    maxProfit: 180,
    maxLoss: 320,
    breakeven: [433.20],
    pop: 72,
    riskLevel: "low" as const,
    description: "Bullish bias with defined risk. Benefits from theta decay while maintaining downside protection.",
    legs: [
      { action: "SELL" as const, type: "PUT" as const, strike: 435, premium: 3.20 },
      { action: "BUY" as const, type: "PUT" as const, strike: 430, premium: 1.40 },
    ],
  },
  {
    rank: 3,
    name: "Call Debit Spread",
    family: "Bullish / Directional",
    maxProfit: 420,
    maxLoss: 180,
    breakeven: [448.80],
    pop: 42,
    riskLevel: "medium" as const,
    description: "Directional play with capped risk. Suitable if expecting upside breakout from current consolidation.",
    legs: [
      { action: "BUY" as const, type: "CALL" as const, strike: 447, premium: 4.20 },
      { action: "SELL" as const, type: "CALL" as const, strike: 455, premium: 2.40 },
    ],
  },
];

const mockTrades = [
  {
    id: "1",
    symbol: "SPY",
    strategy: "Iron Condor",
    status: "active" as const,
    entryDate: "Dec 15, 2024",
    currentPnL: 156.40,
    pnlPercent: 54.9,
    daysRemaining: 12,
  },
  {
    id: "2",
    symbol: "QQQ",
    strategy: "Put Credit Spread",
    status: "adjusting" as const,
    entryDate: "Dec 20, 2024",
    currentPnL: -45.20,
    pnlPercent: -12.8,
    daysRemaining: 8,
    adjustmentNote: "Delta approaching -0.30. Consider rolling down or closing for small loss.",
  },
  {
    id: "3",
    symbol: "AAPL",
    strategy: "Call Diagonal",
    status: "active" as const,
    entryDate: "Dec 10, 2024",
    currentPnL: 89.00,
    pnlPercent: 22.5,
    daysRemaining: 18,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Top metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MarketRegimeCard
            regime="range-bound"
            confidence={78}
            ivRank={65}
            ivPercentile={72}
            structure="Consolidation after pullback. Support at 435, resistance at 460."
          />
          
          <ExpectedMoveCard
            symbol="SPY"
            currentPrice={445.32}
            expectedMove={8.45}
            expectedMovePercent={1.9}
            upperBound={453.77}
            lowerBound={436.87}
            dte={14}
            probability={68}
          />

          <GreeksDisplay
            delta={0.125}
            gamma={0.0089}
            theta={-12.45}
            vega={15.32}
            iv={18.5}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy proposals - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Strategy Proposals</h2>
                <p className="text-sm text-muted-foreground">Ranked by risk-adjusted return potential</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                Updated 2 min ago
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {mockStrategies.map((strategy) => (
                <StrategyCard key={strategy.rank} {...strategy} />
              ))}
            </div>
          </div>

          {/* Trade lifecycle - 1 column */}
          <div className="space-y-6">
            <TradeLifecycleCard trades={mockTrades} />
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            All data is for demonstration purposes. No execution logic. Capital preservation over profit.
            <br />
            <span className="text-primary/70">OPTIXPRO</span> — Institutional-Grade Options Intelligence
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
