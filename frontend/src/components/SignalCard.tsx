'use client';

import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Target, 
    Shield, 
    Clock, 
    Zap, 
    Brain,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    BarChart3,
    Timer,
    AlertTriangle
} from 'lucide-react';

// 🎯 Enhanced Signal Interface
interface SignalCardProps {
    signal: {
        id?: string;
        symbol: string;
        type: 'LONG' | 'SHORT' | 'HOLD' | 'BUY' | 'SELL';
        side?: 'BUY' | 'SELL';
        confidence?: number;
        strength?: number;
        price?: number;
        entry?: number;
        currentPrice?: number;
        timestamp: Date;
        timeframe?: string;
        strategy?: 'BREAKOUT' | 'REVERSAL' | 'TREND' | 'MOMENTUM' | 'SCALP';
        
        // Targets
        targets?: {
            takeProfit1: number;
            takeProfit2: number;
            takeProfit3: number;
            stopLoss: number;
        };
        takeProfit1?: number;
        takeProfit2?: number;
        takeProfit3?: number;
        stopLoss?: number;
        
        riskReward?: number;
        expectedDuration?: number;
        
        indicators?: {
            rsi?: number;
            adx?: number;
            aroon?: number;
            bbBand?: 'UPPER' | 'LOWER' | 'MIDDLE';
            bb_percentB?: number;
            macd?: number;
            volume?: number;
            volume_ratio?: number;
            volatility?: number;
        };
        
        volume24h?: number;
        priceChange24h?: number;
        aiScore?: number;
        marketSentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        status?: 'ACTIVE' | 'COMPLETED' | 'STOPPED' | 'EXPIRED' | 'CANCELLED';
        pnl?: number;
        hitTargets?: ('TP1' | 'TP2' | 'TP3' | 'SL')[];
        reason?: string;
    };
    onTradeAction?: (signalId: string, action: 'follow' | 'close' | 'ignore') => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onTradeAction }) => {
    const [pnlPercent, setPnlPercent] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Normalize signal data
    const normalizedSignal = {
        ...signal,
        confidence: signal.confidence || signal.strength || 0,
        price: signal.price || signal.entry || 0,
        targets: signal.targets || {
            takeProfit1: signal.takeProfit1 || 0,
            takeProfit2: signal.takeProfit2 || 0,
            takeProfit3: signal.takeProfit3 || 0,
            stopLoss: signal.stopLoss || 0
        }
    };

    // PnL Hesaplama
    useEffect(() => {
        if (normalizedSignal.currentPrice && normalizedSignal.price) {
            const signalType = normalizedSignal.type === 'BUY' ? 'LONG' : 
                              normalizedSignal.type === 'SELL' ? 'SHORT' : normalizedSignal.type;
            
            const pnl = signalType === 'LONG' 
                ? ((normalizedSignal.currentPrice - normalizedSignal.price) / normalizedSignal.price) * 100
                : ((normalizedSignal.price - normalizedSignal.currentPrice) / normalizedSignal.price) * 100;
            setPnlPercent(pnl);
        }
    }, [normalizedSignal.currentPrice, normalizedSignal.price, normalizedSignal.type]);

    // Geçen Süre
    useEffect(() => {
        const updateElapsed = () => {
            const elapsed = Math.floor((Date.now() - signal.timestamp.getTime()) / 1000 / 60);
            setTimeElapsed(elapsed);
        };
        
        updateElapsed();
        const interval = setInterval(updateElapsed, 60000);
        return () => clearInterval(interval);
    }, [signal.timestamp]);

    // Renk Temaları
    const getSignalTheme = () => {
        const signalType = normalizedSignal.type === 'BUY' ? 'LONG' : 
                          normalizedSignal.type === 'SELL' ? 'SHORT' : normalizedSignal.type;
        
        if (signalType === 'LONG') {
            return {
                bg: 'from-green-900/20 to-emerald-900/10',
                border: 'border-green-500/30',
                text: 'text-green-400',
                icon: TrendingUp,
                accent: 'text-green-300'
            };
        } else {
            return {
                bg: 'from-red-900/20 to-pink-900/10',
                border: 'border-red-500/30',
                text: 'text-red-400',
                icon: TrendingDown,
                accent: 'text-red-300'
            };
        }
    };

    const theme = getSignalTheme();
    const SignalIcon = theme.icon;

    // Confidence Color
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-400';
        if (confidence >= 65) return 'text-yellow-400';
        return 'text-orange-400';
    };

    // Strategy Badge
    const getStrategyBadge = (strategy?: string) => {
        if (!strategy) return null;
        
        const badges = {
            'BREAKOUT': { color: 'bg-purple-600/20 text-purple-300', icon: Zap },
            'REVERSAL': { color: 'bg-blue-600/20 text-blue-300', icon: Activity },
            'TREND': { color: 'bg-green-600/20 text-green-300', icon: TrendingUp },
            'MOMENTUM': { color: 'bg-orange-600/20 text-orange-300', icon: BarChart3 },
            'SCALP': { color: 'bg-pink-600/20 text-pink-300', icon: Timer }
        };
        
        const badge = badges[strategy as keyof typeof badges];
        if (!badge) return null;
        
        const BadgeIcon = badge.icon;
        
        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.color}`}>
                <BadgeIcon className="w-3 h-3" />
                {strategy}
            </div>
        );
    };

    // Target Status
    const getTargetStatus = (target: 'TP1' | 'TP2' | 'TP3' | 'SL') => {
        const isHit = normalizedSignal.hitTargets?.includes(target);
        if (isHit) {
            return target === 'SL' 
                ? <XCircle className="w-4 h-4 text-red-500" />
                : <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    };

    const formatPrice = (price: number) => {
        if (price === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price > 100 ? 2 : 6
        }).format(price);
    };

    const formatTime = (timestamp: Date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        }).format(new Date(timestamp));
    };

    return (
        <div className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl
            bg-gradient-to-br ${theme.bg} ${theme.border}
            ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}
        `}>
            
            {/* Status Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1">
                <div className={`
                    h-full transition-all duration-1000
                    ${normalizedSignal.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : ''}
                    ${normalizedSignal.status === 'COMPLETED' ? 'bg-blue-500' : ''}
                    ${normalizedSignal.status === 'STOPPED' || normalizedSignal.status === 'CANCELLED' ? 'bg-red-500' : ''}
                    ${normalizedSignal.status === 'EXPIRED' ? 'bg-gray-500' : ''}
                    ${!normalizedSignal.status ? 'bg-yellow-500' : ''}
                `} />
            </div>

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-800/50 ${theme.text}`}>
                            <SignalIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{normalizedSignal.symbol}</h3>
                            <div className="flex items-center gap-2">
                                {getStrategyBadge(normalizedSignal.strategy)}
                                {normalizedSignal.timeframe && (
                                    <span className="text-xs text-gray-400">{normalizedSignal.timeframe}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getConfidenceColor(normalizedSignal.confidence)}`}>
                            {normalizedSignal.confidence}%
                        </div>
                        <div className="text-xs text-gray-400">Güven</div>
                    </div>
                </div>

                {/* Price & PnL */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Giriş Fiyatı</div>
                        <div className="text-lg font-bold text-white">
                            {formatPrice(normalizedSignal.price)}
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">P&L</div>
                        <div className={`text-lg font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {normalizedSignal.currentPrice ? (
                                `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`
                            ) : (
                                'Aktif'
                            )}
                        </div>
                    </div>
                </div>

                {/* Risk/Reward & Duration */}
                <div className="flex items-center justify-between mb-4">
                    {normalizedSignal.riskReward && (
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-300">R/R: {normalizedSignal.riskReward.toFixed(1)}</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">
                            {formatTime(normalizedSignal.timestamp)}
                        </span>
                    </div>
                </div>

                {/* Targets */}
                {(normalizedSignal.targets.takeProfit1 > 0 || normalizedSignal.targets.stopLoss > 0) && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-gray-800/50 rounded p-2 text-center">
                            <div className="flex items-center justify-center mb-1">
                                {getTargetStatus('TP1')}
                            </div>
                            <div className="text-xs text-green-400">TP1</div>
                            <div className="text-xs text-gray-300">
                                {formatPrice(normalizedSignal.targets.takeProfit1)}
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded p-2 text-center">
                            <div className="flex items-center justify-center mb-1">
                                {getTargetStatus('TP2')}
                            </div>
                            <div className="text-xs text-green-400">TP2</div>
                            <div className="text-xs text-gray-300">
                                {formatPrice(normalizedSignal.targets.takeProfit2)}
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded p-2 text-center">
                            <div className="flex items-center justify-center mb-1">
                                {getTargetStatus('TP3')}
                            </div>
                            <div className="text-xs text-green-400">TP3</div>
                            <div className="text-xs text-gray-300">
                                {formatPrice(normalizedSignal.targets.takeProfit3)}
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded p-2 text-center">
                            <div className="flex items-center justify-center mb-1">
                                {getTargetStatus('SL')}
                            </div>
                            <div className="text-xs text-red-400">SL</div>
                            <div className="text-xs text-gray-300">
                                {formatPrice(normalizedSignal.targets.stopLoss)}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Score & Market Sentiment */}
                {(normalizedSignal.aiScore || normalizedSignal.marketSentiment) && (
                    <div className="flex items-center justify-between mb-4">
                        {normalizedSignal.aiScore && (
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-gray-300">AI Skoru: </span>
                                <span className="text-sm font-semibold text-cyan-400">{normalizedSignal.aiScore}</span>
                            </div>
                        )}
                        
                        {normalizedSignal.marketSentiment && (
                            <div className={`
                                px-2 py-1 rounded text-xs font-medium
                                ${normalizedSignal.marketSentiment === 'BULLISH' ? 'bg-green-600/20 text-green-300' : ''}
                                ${normalizedSignal.marketSentiment === 'BEARISH' ? 'bg-red-600/20 text-red-300' : ''}
                                ${normalizedSignal.marketSentiment === 'NEUTRAL' ? 'bg-gray-600/20 text-gray-300' : ''}
                            `}>
                                {normalizedSignal.marketSentiment}
                            </div>
                        )}
                    </div>
                )}

                {/* Technical Indicators */}
                {normalizedSignal.indicators && Object.keys(normalizedSignal.indicators).length > 0 && (
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Teknik İndikatörler</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {normalizedSignal.indicators.rsi && (
                                <div className="flex justify-between">
                                    <span>RSI:</span>
                                    <span className={
                                        normalizedSignal.indicators.rsi > 70 ? 'text-red-400' :
                                        normalizedSignal.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                                    }>
                                        {normalizedSignal.indicators.rsi.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {normalizedSignal.indicators.adx && (
                                <div className="flex justify-between">
                                    <span>ADX:</span>
                                    <span className={normalizedSignal.indicators.adx > 25 ? 'text-green-400' : 'text-yellow-400'}>
                                        {normalizedSignal.indicators.adx.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {normalizedSignal.indicators.volume_ratio && (
                                <div className="flex justify-between">
                                    <span>Hacim:</span>
                                    <span className={normalizedSignal.indicators.volume_ratio > 1.5 ? 'text-green-400' : 'text-yellow-400'}>
                                        {normalizedSignal.indicators.volume_ratio.toFixed(1)}x
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reason */}
                {normalizedSignal.reason && (
                    <div className="border-t border-gray-700 pt-3 mb-4">
                        <div className="text-sm text-gray-400 mb-1">Analiz Nedeni</div>
                        <p className="text-sm leading-relaxed text-gray-300">{normalizedSignal.reason}</p>
                    </div>
                )}

                {/* Action Buttons */}
                {onTradeAction && normalizedSignal.id && (
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => onTradeAction(normalizedSignal.id!, 'follow')}
                            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Takip Et
                        </button>
                        
                        <button
                            onClick={() => onTradeAction(normalizedSignal.id!, 'close')}
                            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Kapat
                        </button>
                        
                        <button
                            onClick={() => onTradeAction(normalizedSignal.id!, 'ignore')}
                            className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Yoksay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignalCard;
