import { Clock, CheckCircle2, AlertCircle, XCircle, RotateCcw } from "lucide-react";

interface TradeLifecycleCardProps {
  trades: {
    id: string;
    symbol: string;
    strategy: string;
    status: "pending" | "active" | "adjusting" | "closed" | "expired";
    entryDate: string;
    currentPnL: number;
    pnlPercent: number;
    daysRemaining: number;
    adjustmentNote?: string;
  }[];
}

const statusConfig = {
  pending: { icon: Clock, label: "Pending", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  active: { icon: CheckCircle2, label: "Active", colorClass: "text-bullish", bgClass: "bg-bullish/10" },
  adjusting: { icon: RotateCcw, label: "Adjusting", colorClass: "text-warning", bgClass: "bg-warning/10" },
  closed: { icon: XCircle, label: "Closed", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  expired: { icon: AlertCircle, label: "Expired", colorClass: "text-bearish", bgClass: "bg-bearish/10" },
};

export function TradeLifecycleCard({ trades }: TradeLifecycleCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trade Lifecycle
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {trades.filter(t => t.status === "active").length} active
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {trades.map((trade) => {
          const config = statusConfig[trade.status];
          const StatusIcon = config.icon;
          const isProfitable = trade.currentPnL >= 0;

          return (
            <div key={trade.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${config.bgClass}`}>
                    <StatusIcon className={`w-4 h-4 ${config.colorClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{trade.symbol}</span>
                      <span className="text-xs text-muted-foreground">{trade.strategy}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Opened {trade.entryDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm font-semibold ${isProfitable ? "text-bullish" : "text-bearish"}`}>
                    {isProfitable ? "+" : ""}{trade.currentPnL.toFixed(2)}
                  </div>
                  <div className={`font-mono text-xs ${isProfitable ? "text-bullish" : "text-bearish"}`}>
                    {isProfitable ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded ${config.bgClass} ${config.colorClass}`}>
                    {config.label}
                  </span>
                  {trade.daysRemaining > 0 && (
                    <span className="text-muted-foreground">
                      {trade.daysRemaining} days remaining
                    </span>
                  )}
                </div>
              </div>

              {trade.adjustmentNote && (
                <div className="mt-2 px-3 py-2 rounded bg-warning/10 border border-warning/20">
                  <span className="text-xs text-warning">{trade.adjustmentNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
