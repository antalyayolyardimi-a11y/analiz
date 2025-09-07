import { SignalProcessor } from './SignalProcessor';
import { TechnicalAnalyzer } from './TechnicalAnalyzer';

export { SignalProcessor, TechnicalAnalyzer };

// Signal Processor'ı başlat
const signalProcessor = new SignalProcessor();

console.log('🔄 Signal Processor başlatılıyor...');

export default signalProcessor;
