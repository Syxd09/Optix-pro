import { TrendingUp, TrendingDown, Activity, Minus } from "lucide-react";

interface MarketRegimeCardProps {
  regime: "trending-up" | "trending-down" | "range-bound" | "high-volatility";
  confidence: number;
  ivRank: number;
  ivPercentile: number;
  structure: string;
}

const regimeConfig = {
  "trending-up": {
    label: "Trending Up",
    icon: TrendingUp,
    colorClass: "text-bullish",
    bgClass: "bg-bullish/10",
    borderClass: "border-bullish/30",
  },
  "trending-down": {
    label: "Trending Down",
    icon: TrendingDown,
    colorClass: "text-bearish",
    bgClass: "bg-bearish/10",
    borderClass: "border-bearish/30",
  },
  "range-bound": {
    label: "Range Bound",
    icon: Minus,
    colorClass: "text-neutral-signal",
    bgClass: "bg-neutral/10",
    borderClass: "border-neutral/30",
  },
  "high-volatility": {
    label: "High Volatility",
    icon: Activity,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
  },
};

export function MarketRegimeCard({
  regime,
  confidence,
  ivRank,
  ivPercentile,
  structure,
}: MarketRegimeCardProps) {
  const config = regimeConfig[regime];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Market Regime
        </h3>
        <div className="status-indicator bg-primary" />
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${config.bgClass} ${config.borderClass} border mb-4`}>
        <Icon className={`w-5 h-5 ${config.colorClass}`} />
        <span className={`font-semibold ${config.colorClass}`}>{config.label}</span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="font-mono text-sm text-foreground">{confidence}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">IV Rank</span>
          <span className="font-mono text-sm text-foreground">{ivRank}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">IV Percentile</span>
          <span className="font-mono text-sm text-foreground">{ivPercentile}%</span>
        </div>

        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground block mb-1">Structure</span>
          <span className="text-sm font-mono text-foreground">{structure}</span>
        </div>
      </div>
    </div>
  );
}
