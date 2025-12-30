import { Activity, Settings, Bell, Database } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center terminal-glow">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  OPTIX<span className="text-primary">PRO</span>
                </h1>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Trading Intelligence
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
              <div className="status-indicator bg-bullish" />
              <span className="text-xs font-mono text-muted-foreground">MARKET OPEN</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
              <Database className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">DATA: LIVE</span>
            </div>

            <button className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
