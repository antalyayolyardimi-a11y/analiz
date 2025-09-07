import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

// Load environment variables
dotenv.config();

// Logger konfigürasyonu
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({ format: format.simple() })
  ]
});

// Interfaces
export interface SignalData {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT' | 'NEUTRAL';
  strength: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  reason: string;
  timestamp: Date;
  timeframe: string;
  indicators: any;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface MarketAlert {
  id: string;
  symbol: string;
  type: 'PUMP' | 'DUMP' | 'BREAKOUT' | 'BREAKDOWN';
  message: string;
  percentage: number;
  volume: number;
  timestamp: Date;
  reason: string;
}

export interface AnalysisRequest {
  symbol: string;
  timeframes: ('15m' | '1h' | '4h' | '1d')[];
  indicators?: string[];
}

class CryptoSignalAPI {
  private app: Application;
  private server;
  private io: SocketIOServer;
  private port: number;
  private signals: Map<string, SignalData> = new Map();
  private alerts: MarketAlert[] = [];

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.port = parseInt(process.env.PORT || '3001', 10);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.url} - ${req.ip}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes
    this.app.use('/api/signals', this.createSignalRoutes());
    this.app.use('/api/market', this.createMarketRoutes());
    this.app.use('/api/analysis', this.createAnalysisRoutes());

    // Error handling
    this.app.use(this.errorHandler);
  }

  private createSignalRoutes() {
    const router = express.Router();

    // Get all active signals
    router.get('/', (req: Request, res: Response) => {
      try {
        const activeSignals = Array.from(this.signals.values())
          .filter(signal => signal.status === 'ACTIVE')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json({
          success: true,
          data: activeSignals,
          count: activeSignals.length
        });
      } catch (error) {
        logger.error('Error fetching signals:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch signals'
        });
      }
    });

    // Get signal by ID
    router.get('/:id', (req: Request, res: Response) => {
      try {
        const signal = this.signals.get(req.params.id);
        
        if (!signal) {
          return res.status(404).json({
            success: false,
            error: 'Signal not found'
          });
        }

        res.json({
          success: true,
          data: signal
        });
      } catch (error) {
        logger.error('Error fetching signal:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch signal'
        });
      }
    });

    // Create new signal (internal use)
    router.post('/', (req: Request, res: Response) => {
      try {
        const signalData: Omit<SignalData, 'id' | 'timestamp' | 'status'> = req.body;
        
        const signal: SignalData = {
          ...signalData,
          id: this.generateId(),
          timestamp: new Date(),
          status: 'ACTIVE'
        };

        this.signals.set(signal.id, signal);
        
        // Broadcast to all connected clients
        this.io.emit('newSignal', signal);
        
        logger.info(`New signal created: ${signal.symbol} ${signal.type}`);

        res.status(201).json({
          success: true,
          data: signal
        });
      } catch (error) {
        logger.error('Error creating signal:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create signal'
        });
      }
    });

    // Update signal status
    router.patch('/:id/status', (req: Request, res: Response) => {
      try {
        const signal = this.signals.get(req.params.id);
        
        if (!signal) {
          return res.status(404).json({
            success: false,
            error: 'Signal not found'
          });
        }

        const { status } = req.body;
        if (!['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid status'
          });
        }

        signal.status = status;
        this.signals.set(signal.id, signal);

        // Broadcast update
        this.io.emit('signalUpdate', signal);

        res.json({
          success: true,
          data: signal
        });
      } catch (error) {
        logger.error('Error updating signal:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update signal'
        });
      }
    });

    return router;
  }

  private createMarketRoutes() {
    const router = express.Router();

    // Get market alerts
    router.get('/alerts', (req: Request, res: Response) => {
      try {
        const recentAlerts = this.alerts
          .filter(alert => 
            Date.now() - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
          )
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50); // Latest 50 alerts

        res.json({
          success: true,
          data: recentAlerts,
          count: recentAlerts.length
        });
      } catch (error) {
        logger.error('Error fetching alerts:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch alerts'
        });
      }
    });

    // Create market alert (internal use)
    router.post('/alerts', (req: Request, res: Response) => {
      try {
        const alertData: Omit<MarketAlert, 'id' | 'timestamp'> = req.body;
        
        const alert: MarketAlert = {
          ...alertData,
          id: this.generateId(),
          timestamp: new Date()
        };

        this.alerts.push(alert);
        
        // Keep only last 1000 alerts in memory
        if (this.alerts.length > 1000) {
          this.alerts = this.alerts.slice(-1000);
        }

        // Broadcast to all connected clients
        this.io.emit('marketAlert', alert);
        
        logger.info(`New market alert: ${alert.symbol} ${alert.type} - ${alert.message}`);

        res.status(201).json({
          success: true,
          data: alert
        });
      } catch (error) {
        logger.error('Error creating alert:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create alert'
        });
      }
    });

    return router;
  }

  private createAnalysisRoutes() {
    const router = express.Router();

    // Request analysis for specific coin
    router.post('/analyze', async (req: Request, res: Response) => {
      try {
        const { symbol, timeframes = ['15m', '1h'] }: AnalysisRequest = req.body;

        if (!symbol) {
          return res.status(400).json({
            success: false,
            error: 'Symbol is required'
          });
        }

        // Trigger analysis (this would normally call your signal processor)
        const analysisResult = await this.performAnalysis(symbol, timeframes);

        res.json({
          success: true,
          data: analysisResult
        });

      } catch (error) {
        logger.error('Error performing analysis:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to perform analysis'
        });
      }
    });

    // Get supported symbols
    router.get('/symbols', (req: Request, res: Response) => {
      try {
        // Mock data - would come from KuCoin API
        const symbols = [
          'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'SOL-USDT',
          'XRP-USDT', 'DOT-USDT', 'AVAX-USDT', 'MATIC-USDT', 'ATOM-USDT'
        ];

        res.json({
          success: true,
          data: symbols,
          count: symbols.length
        });
      } catch (error) {
        logger.error('Error fetching symbols:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch symbols'
        });
      }
    });

    return router;
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Send current active signals to new client
      const activeSignals = Array.from(this.signals.values())
        .filter(signal => signal.status === 'ACTIVE');
      
      socket.emit('activeSignals', activeSignals);

      // Send recent alerts
      const recentAlerts = this.alerts
        .filter(alert => 
          Date.now() - new Date(alert.timestamp).getTime() < 60 * 60 * 1000 // Last hour
        );
      
      socket.emit('recentAlerts', recentAlerts);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on('subscribe', (data) => {
        logger.info(`Client ${socket.id} subscribed to ${data.symbols}`);
        // Handle symbol-specific subscriptions
      });
    });
  }

  private async performAnalysis(symbol: string, timeframes: string[]): Promise<any> {
    // Mock analysis - would integrate with your signal processor
    return {
      symbol,
      timeframes,
      analysis: {
        trend: 'BULLISH',
        strength: 75,
        support: 43250,
        resistance: 45800,
        indicators: {
          rsi: 58.2,
          macd: 'BULLISH',
          adx: 32.5
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  private errorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
    logger.error('Unhandled error:', error);

    res.status(error.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`📊 Socket.IO server ready`);
      logger.info(`🔗 API available at http://localhost:${this.port}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  }
}

// Start server
if (require.main === module) {
  const api = new CryptoSignalAPI();
  api.start();
}

export default CryptoSignalAPI;
