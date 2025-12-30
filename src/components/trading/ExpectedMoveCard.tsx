import { ArrowUpDown, Clock, Target } from "lucide-react";

interface ExpectedMoveCardProps {
  symbol: string;
  currentPrice: number;
  expectedMove: number;
  expectedMovePercent: number;
  upperBound: number;
  lowerBound: number;
  dte: number;
  probability: number;
}

export function ExpectedMoveCard({
  symbol,
  currentPrice,
  expectedMove,
  expectedMovePercent,
  upperBound,
  lowerBound,
  dte,
  probability,
}: ExpectedMoveCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Expected Move
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{dte} DTE</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold font-mono text-foreground">{symbol}</span>
        <span className="text-xl font-mono text-muted-foreground">${currentPrice.toFixed(2)}</span>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ArrowUpDown className="w-4 h-4 text-primary" />
          <span className="text-lg font-mono font-semibold text-primary">
            ±${expectedMove.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({expectedMovePercent.toFixed(1)}%)
          </span>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {probability}% probability range
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-bullish" />
            <span className="text-xs text-muted-foreground">Upper Bound</span>
          </div>
          <span className="font-mono text-lg text-bullish">${upperBound.toFixed(2)}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-bearish" />
            <span className="text-xs text-muted-foreground">Lower Bound</span>
          </div>
          <span className="font-mono text-lg text-bearish">${lowerBound.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
