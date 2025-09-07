# Kucoin Long/Short Signal Bot

A modern, Next.js-based trading bot that captures long/short signals using the Kucoin API. This bot analyzes cryptocurrency market data and provides intelligent trading signals with confidence levels and detailed analysis.

![Trading Signals](https://github.com/user-attachments/assets/50508cbc-e661-4615-96ac-d26c33df7ae3)

## Features

### 🎯 Trading Signals
- **Real-time Signal Detection**: Automated analysis of cryptocurrency price movements
- **Long/Short Positions**: Clear indicators for bullish and bearish market conditions
- **Confidence Scoring**: Each signal comes with a confidence percentage (0-100%)
- **Detailed Analysis**: Explains the reasoning behind each signal
- **Interactive Filters**: Filter by signal type and minimum confidence level
- **Auto-refresh**: Signals update every 30 seconds

### 📊 Market Overview
- **Live Market Statistics**: Total volume, active pairs, gainers/losers count
- **Volume Charts**: Visual representation of top cryptocurrencies by trading volume
- **Top Gainers/Losers**: Real-time tracking of best and worst performing assets
- **Comprehensive Data**: Price, volume, and percentage changes

### 🔧 Technical Features
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Demo Mode**: Test the interface with realistic mock data
- **Error Handling**: Graceful fallback to demo data if API is unavailable
- **Real-time Updates**: Automatic data refresh with loading indicators

## Signal Analysis Algorithm

The bot uses a sophisticated multi-factor analysis approach:

1. **Trend Analysis**: Detects uptrends and downtrends using recent candlestick data
2. **Volume Analysis**: Identifies volume spikes that confirm price movements
3. **Price Movement**: Analyzes 24-hour price changes and volatility
4. **Confidence Scoring**: Combines multiple indicators for reliability assessment

### Signal Types

- **LONG**: Bullish signals indicating potential price increases
- **SHORT**: Bearish signals indicating potential price decreases
- **NEUTRAL**: No clear direction detected

## Screenshots

### Trading Signals Dashboard
![Trading Signals](https://github.com/user-attachments/assets/50508cbc-e661-4615-96ac-d26c33df7ae3)

### Market Overview
![Market Overview](https://github.com/user-attachments/assets/080496ca-b383-40f6-9dc1-8d6ebc75a2c5)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/antalyayolyardimi-a11y/analiz.git
cd analiz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## API Integration

The bot integrates with the Kucoin public API:

- **Market Data**: `/api/v1/market/allTickers` - 24h ticker statistics
- **Candlestick Data**: `/api/v1/market/candles` - OHLCV data for trend analysis
- **Symbol Information**: `/api/v1/symbols` - Trading pair details

## Architecture

```
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── header.tsx        # Navigation header
│   ├── market-overview.tsx # Market statistics and charts
│   ├── signal-card.tsx   # Individual signal display
│   └── signal-list.tsx   # Signal grid and filters
├── hooks/                # Custom React hooks
│   └── use-kucoin-data.ts # Data fetching hook
├── lib/                  # Utility libraries
│   ├── kucoin-api.ts    # API integration
│   ├── signal-analyzer.ts # Signal detection logic
│   └── demo-data.ts     # Mock data for demo mode
```

## Configuration

### Demo Mode
Toggle between live data and demo mode using the header button. Demo mode is useful for:
- Testing the interface
- Development without API rate limits
- Demonstrations and screenshots

### Signal Parameters
Adjust signal detection sensitivity by modifying:
- Minimum volume thresholds
- Confidence calculation weights
- Trend detection periods

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client for API requests
- **Lucide React** - Modern icon library

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This bot is for educational and informational purposes only. It should not be considered as financial advice. Always do your own research before making any trading decisions. Cryptocurrency trading involves significant risk and can result in financial loss.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

Built with ❤️ for the crypto trading community
