interface GreeksDisplayProps {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
}

export function GreeksDisplay({ delta, gamma, theta, vega, iv }: GreeksDisplayProps) {
  const greeks = [
    { name: "Delta", value: delta, format: (v: number) => v.toFixed(3), colorFn: (v: number) => v >= 0 ? "text-bullish" : "text-bearish" },
    { name: "Gamma", value: gamma, format: (v: number) => v.toFixed(4), colorFn: () => "text-foreground" },
    { name: "Theta", value: theta, format: (v: number) => v.toFixed(2), colorFn: (v: number) => v >= 0 ? "text-bullish" : "text-bearish" },
    { name: "Vega", value: vega, format: (v: number) => v.toFixed(2), colorFn: () => "text-foreground" },
    { name: "IV", value: iv, format: (v: number) => `${v.toFixed(1)}%`, colorFn: () => "text-primary" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Position Greeks
      </h3>

      <div className="grid grid-cols-5 gap-4">
        {greeks.map((greek) => (
          <div key={greek.name} className="text-center">
            <span className="text-xs text-muted-foreground block mb-1">
              {greek.name}
            </span>
            <span className={`font-mono text-lg font-semibold ${greek.colorFn(greek.value)}`}>
              {greek.format(greek.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
