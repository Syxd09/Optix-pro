import { Shield, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StrategyCardProps {
  rank: number;
  name: string;
  family: string;
  maxProfit: number | "unlimited";
  maxLoss: number;
  breakeven: number[];
  pop: number; // Probability of Profit
  riskLevel: "low" | "medium" | "high";
  description: string;
  legs: {
    action: "BUY" | "SELL";
    type: "CALL" | "PUT";
    strike: number;
    premium: number;
  }[];
}

const riskConfig = {
  low: { label: "Low Risk", colorClass: "text-bullish", bgClass: "bg-bullish/10" },
  medium: { label: "Medium Risk", colorClass: "text-neutral-signal", bgClass: "bg-neutral/10" },
  high: { label: "High Risk", colorClass: "text-bearish", bgClass: "bg-bearish/10" },
};

export function StrategyCard({
  rank,
  name,
  family,
  maxProfit,
  maxLoss,
  breakeven,
  pop,
  riskLevel,
  description,
  legs,
}: StrategyCardProps) {
  const risk = riskConfig[riskLevel];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors duration-200 animate-fade-in-up" style={{ animationDelay: `${0.1 * rank}s` }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">#{rank}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <span className="text-xs text-muted-foreground">{family}</span>
            </div>
          </div>
          <Badge variant="outline" className={`${risk.bgClass} ${risk.colorClass} border-0`}>
            <Shield className="w-3 h-3 mr-1" />
            {risk.label}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Max Profit</span>
            <span className="font-mono text-sm text-bullish">
              {maxProfit === "unlimited" ? "Unlimited" : `$${maxProfit.toFixed(0)}`}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Max Loss</span>
            <span className="font-mono text-sm text-bearish">${maxLoss.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">POP</span>
            <span className="font-mono text-sm text-foreground">{pop}%</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <span className="text-xs text-muted-foreground">Breakeven</span>
          <div className="flex gap-2 flex-wrap">
            {breakeven.map((be, i) => (
              <span key={i} className="px-2 py-1 rounded bg-muted font-mono text-xs text-foreground">
                ${be.toFixed(2)}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <span className="text-xs text-muted-foreground block mb-2">Position Legs</span>
          <div className="space-y-2">
            {legs.map((leg, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    leg.action === "BUY" ? "bg-bullish/20 text-bullish" : "bg-bearish/20 text-bearish"
                  }`}>
                    {leg.action}
                  </span>
                  <span className="text-foreground">{leg.strike} {leg.type}</span>
                </div>
                <span className="font-mono text-muted-foreground">${leg.premium.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full px-5 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <span>View Full Analysis</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
