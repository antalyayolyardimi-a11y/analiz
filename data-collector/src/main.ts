import { KuCoinDataCollector } from './index';
import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

// Logs dizinini oluştur
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Main logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
  ),
  transports: [
    new transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB  
      maxFiles: 5
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

/**
 * Ana uygulama başlatıcı
 */
class DataCollectorApp {
  private collector: KuCoinDataCollector | null = null;

  async start(): Promise<void> {
    try {
      logger.info('🚀 KuCoin Data Collector başlatılıyor...');
      logger.info('📋 Sistem Bilgileri:');
      logger.info(`   - Node.js: ${process.version}`);
      logger.info(`   - Platform: ${process.platform}`);
      logger.info(`   - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
      logger.info(`   - PID: ${process.pid}`);

      // Data collector'ı başlat
      this.collector = new KuCoinDataCollector();
      
      logger.info('✅ Data Collector başlatıldı');
      logger.info('🔗 WebSocket bağlantıları kuruluyor...');
      logger.info('📊 Market verileri toplanmaya başlanacak...');
      logger.info('⏰ Periyodik analiz: Her 5 dakikada bir');
      logger.info('🎯 Hedef: 50M$+ hacimli coinler');
      
      // Sistem sağlık durumu
      this.startHealthCheck();
      
    } catch (error) {
      logger.error('❌ Data Collector başlatılırken hata:', error);
      process.exit(1);
    }
  }

  /**
   * Sistem sağlık kontrolü
   */
  private startHealthCheck(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      logger.info(`💊 Sistem Durumu - Memory: ${memMB}MB | Uptime: ${Math.round(process.uptime())}s`);
      
      // Yüksek memory kullanımı uyarısı
      if (memMB > 500) {
        logger.warn(`⚠️ Yüksek memory kullanımı: ${memMB}MB`);
      }
      
    }, 5 * 60 * 1000); // Her 5 dakikada kontrol
  }

  /**
   * Graceful shutdown
   */
  async stop(): Promise<void> {
    try {
      logger.info('🛑 Sistem kapatılıyor...');
      
      if (this.collector) {
        this.collector.close();
        logger.info('✅ Data Collector durduruldu');
      }
      
      logger.info('👋 Güle güle!');
      process.exit(0);
      
    } catch (error) {
      logger.error('❌ Sistem kapatılırken hata:', error);
      process.exit(1);
    }
  }
}

// Uygulama başlatma
const app = new DataCollectorApp();

// Signal handling
process.on('SIGTERM', async () => {
  logger.info('📨 SIGTERM sinyali alındı');
  await app.stop();
});

process.on('SIGINT', async () => {
  logger.info('📨 SIGINT sinyali alındı (Ctrl+C)');
  await app.stop();
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Yakalanmamış hata:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Yakalanmamış promise reddi:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

// Başlat
if (require.main === module) {
  app.start().catch((error) => {
    logger.error('❌ Uygulama başlatılamadı:', error);
    process.exit(1);
  });
}

export default DataCollectorApp;
