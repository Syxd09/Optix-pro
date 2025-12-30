# OPTIXPRO

**Institutional-Grade Options Trading Intelligence System**

OPTIXPRO is a sophisticated reasoning engine and dashboard designed to provide professional traders with data-driven strategy recommendations, market regime analysis, and active trade monitoring. It is not a signal bot, but a strategic decision support system that prioritizes capital preservation and auditability.

## 🚀 Core Features

- **Market Regime Analysis**: Automatically classifies market conditions (Volatility, Structure, Direction) to determine optimal engagement.
- **Strategic Reasoning Engine**: Deterministic logic that recommends defined-risk strategies (Iron Condor, Iron Butterfly, Credit Spreads) based on current regime.
- **Active Trade Monitoring**: Continuously evaluates open positions for thesis breaks, breach conditions, and profit targets.
- **Post-Trade Autopsy**: Analyzes completed trades to classify mistakes, extract lessons, and calibrate confidence.
- **Institutional Guardrails**: Enforces strict risk management rules, including "NO_TRADE" recommendations when confidence is low.

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI/UX**: shadcn/ui, Tailwind CSS (Custom Trading Theme), Lucide Icons
- **State Management**: TanStack Query
- **Architecture**: Modular "Reasoning Engine" decoupled from UI

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Optix-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Verify the Engine**
   Run the integrated test scenarios to verify the reasoning engine's logic:
   ```bash
   npx tsx src/engine/examples.ts
   ```

## 📂 Project Structure

- `src/engine/`: Core deterministic reasoning logic (Regime, Strategy, Monitor, Analyzer)
- `src/components/trading/`: UI components for the trading dashboard
- `src/pages/`: Application routes and pages
- `src/hooks/`: Custom React hooks

## 🛡️ Philosophy

- **Capital Preservation > Profit**: Survival is the primary objective.
- **Deterministic & Auditable**: Every recommendation is traceable to specific data points.
- **No Black Boxes**: All logic is explainable and distinct from "AI hallucinations".

---
*Note: This system is currently in prototype/paper-trading mode. Integration with live market data feeds is required for production use.*
