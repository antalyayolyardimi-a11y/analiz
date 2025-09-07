"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const winston_1 = require("winston");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Logs dizinini oluştur
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
// Main logger
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })),
    transports: [
        new winston_1.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston_1.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB  
            maxFiles: 5
        }),
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
        })
    ]
});
/**
 * Ana uygulama başlatıcı
 */
class DataCollectorApp {
    constructor() {
        this.collector = null;
    }
    async start() {
        try {
            logger.info('🚀 KuCoin Data Collector başlatılıyor...');
            logger.info('📋 Sistem Bilgileri:');
            logger.info(`   - Node.js: ${process.version}`);
            logger.info(`   - Platform: ${process.platform}`);
            logger.info(`   - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
            logger.info(`   - PID: ${process.pid}`);
            // Data collector'ı başlat
            this.collector = new index_1.KuCoinDataCollector();
            logger.info('✅ Data Collector başlatıldı');
            logger.info('🔗 WebSocket bağlantıları kuruluyor...');
            logger.info('📊 Market verileri toplanmaya başlanacak...');
            logger.info('⏰ Periyodik analiz: Her 5 dakikada bir');
            logger.info('🎯 Hedef: 50M$+ hacimli coinler');
            // Sistem sağlık durumu
            this.startHealthCheck();
        }
        catch (error) {
            logger.error('❌ Data Collector başlatılırken hata:', error);
            process.exit(1);
        }
    }
    /**
     * Sistem sağlık kontrolü
     */
    startHealthCheck() {
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
    async stop() {
        try {
            logger.info('🛑 Sistem kapatılıyor...');
            if (this.collector) {
                this.collector.close();
                logger.info('✅ Data Collector durduruldu');
            }
            logger.info('👋 Güle güle!');
            process.exit(0);
        }
        catch (error) {
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
exports.default = DataCollectorApp;
//# sourceMappingURL=main.js.map