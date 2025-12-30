import { Header } from "@/components/trading/Header";
import { MarketRegimeCard } from "@/components/trading/MarketRegimeCard";
import { ExpectedMoveCard } from "@/components/trading/ExpectedMoveCard";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { TradeLifecycleCard } from "@/components/trading/TradeLifecycleCard";
import { GreeksDisplay } from "@/components/trading/GreeksDisplay";

// NIFTY Live Market Data
const mockStrategies = [
  {
    rank: 1,
    name: "Iron Butterfly",
    family: "Neutral / Income",
    maxProfit: 5900,
    maxLoss: 4100,
    breakeven: [25841, 25959],
    pop: 58,
    riskLevel: "low" as const,
    description: "Optimal for low IV regime with range-bound structure. Maximum profit at POC (25900). Defined risk with favorable theta decay. Target 50% profit.",
    legs: [
      { action: "BUY" as const, type: "PUT" as const, strike: 25800, premium: 28.50 },
      { action: "SELL" as const, type: "PUT" as const, strike: 25900, premium: 48.00 },
      { action: "SELL" as const, type: "CALL" as const, strike: 25900, premium: 52.00 },
      { action: "BUY" as const, type: "CALL" as const, strike: 26000, premium: 32.50 },
    ],
  },
  {
    rank: 2,
    name: "Put Credit Spread",
    family: "Bullish / Income",
    maxProfit: 2450,
    maxLoss: 2550,
    breakeven: [25775.50],
    pop: 72,
    riskLevel: "low" as const,
    description: "Aligned with slight bullish bias and MA support structure. Collect theta with 20DMA as backstop. Short strike below value area low.",
    legs: [
      { action: "SELL" as const, type: "PUT" as const, strike: 25800, premium: 28.50 },
      { action: "BUY" as const, type: "PUT" as const, strike: 25750, premium: 22.00 },
    ],
  },
  {
    rank: 3,
    name: "Calendar Spread",
    family: "Neutral / Volatility",
    maxProfit: 3200,
    maxLoss: 1850,
    breakeven: [25820, 25980],
    pop: 55,
    riskLevel: "medium" as const,
    description: "Position for IV expansion around US ISM PMI event on Jan 2. Long back-month vega, short front-month theta. Profits from vol crush differential.",
    legs: [
      { action: "SELL" as const, type: "CALL" as const, strike: 25900, premium: 52.00 },
      { action: "BUY" as const, type: "CALL" as const, strike: 25900, premium: 78.50 },
    ],
  },
];

const mockTrades = [
  {
    id: "1",
    symbol: "NIFTY",
    strategy: "Iron Condor",
    status: "active" as const,
    entryDate: "Dec 23, 2024",
    currentPnL: 2840.00,
    pnlPercent: 42.5,
    daysRemaining: 8,
  },
  {
    id: "2",
    symbol: "BANKNIFTY",
    strategy: "Short Strangle",
    status: "adjusting" as const,
    entryDate: "Dec 26, 2024",
    currentPnL: -1250.00,
    pnlPercent: -8.2,
    daysRemaining: 5,
    adjustmentNote: "Call side breached. Roll up short call or convert to Iron Condor for defined risk.",
  },
  {
    id: "3",
    symbol: "NIFTY",
    strategy: "Put Credit Spread",
    status: "active" as const,
    entryDate: "Dec 20, 2024",
    currentPnL: 1680.00,
    pnlPercent: 68.0,
    daysRemaining: 3,
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
            confidence={82}
            ivRank={18}
            ivPercentile={22}
            structure="Low volatility consolidation near 52w high. Support 25640, resistance 26080. POC at 25900."
          />
          
          <ExpectedMoveCard
            symbol="NIFTY"
            currentPrice={25925.95}
            expectedMove={118}
            expectedMovePercent={0.46}
            upperBound={26043.95}
            lowerBound={25807.95}
            dte={7}
            probability={68}
          />

          <GreeksDisplay
            delta={0.045}
            gamma={0.0012}
            theta={-8.50}
            vega={42.80}
            iv={10.2}
          />
        </div>

        {/* Analysis Summary Card */}
        <div className="rounded-lg border border-border bg-card p-5 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Regime Analysis
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Volatility Regime</span>
              <span className="font-mono text-sm px-2 py-1 rounded bg-bullish/10 text-bullish">LOW</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Market Structure</span>
              <span className="font-mono text-sm px-2 py-1 rounded bg-neutral/10 text-neutral-signal">RANGE-BOUND</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Directional Bias</span>
              <span className="font-mono text-sm px-2 py-1 rounded bg-muted text-foreground">NEUTRAL → SLIGHT BULL</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Next Event</span>
              <span className="font-mono text-sm px-2 py-1 rounded bg-warning/10 text-warning">ISM PMI (Jan 2)</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground block mb-2">Key Levels</span>
            <div className="flex flex-wrap gap-3 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-bearish/10 text-bearish">SUP: 25640</span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">VAL: 25750</span>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">POC: 25900</span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">VAH: 26250</span>
              <span className="px-2 py-1 rounded bg-bullish/10 text-bullish">RES: 26080</span>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy proposals - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Strategy Proposals</h2>
                <p className="text-sm text-muted-foreground">Optimized for low-IV range-bound regime</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                NIFTY 25925.95
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {mockStrategies.map((strategy) => (
                <StrategyCard key={strategy.rank} {...strategy} />
              ))}
            </div>

            {/* Risk Factors */}
            <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Risk Factors
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-md bg-warning/5 border border-warning/20">
                  <div className="w-2 h-2 rounded-full bg-warning mt-1.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground">Event Risk</span>
                    <p className="text-xs text-muted-foreground mt-0.5">US ISM Manufacturing PMI on Jan 2 could inject directional volatility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground">Structural</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Price near 52w high creates crowded long positioning risk</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-bullish/5 border border-bullish/20">
                  <div className="w-2 h-2 rounded-full bg-bullish mt-1.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground">IV Environment</span>
                    <p className="text-xs text-muted-foreground mt-0.5">IV Rank 18 — cheap options for directional plays, unfavorable for naked premium selling</p>
                  </div>
                </div>
              </div>
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
