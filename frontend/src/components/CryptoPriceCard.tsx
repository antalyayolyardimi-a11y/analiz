import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Zap, Target, Clock, Trophy, AlertTriangle } from 'lucide-react';

interface CryptoPriceCardProps {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume24h: number;
    high24h?: number;
    low24h?: number;
    marketCap?: number;
    isFixed?: boolean;
}

const CryptoPriceCard: React.FC<CryptoPriceCardProps> = ({
    symbol,
    name,
    price,
    change24h,
    volume24h,
    high24h,
    low24h,
    marketCap,
    isFixed = false
}) => {
    const [currentPrice, setCurrentPrice] = useState(price);
    const [priceAnimation, setPriceAnimation] = useState<'up' | 'down' | null>(null);

    // Fiyat güncellemesi animasyonu
    useEffect(() => {
        if (price !== currentPrice) {
            setPriceAnimation(price > currentPrice ? 'up' : 'down');
            setCurrentPrice(price);
            
            const timer = setTimeout(() => {
                setPriceAnimation(null);
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [price, currentPrice]);

    const isPositive = change24h >= 0;
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: price > 100 ? 2 : 4
    }).format(currentPrice);

    const formattedVolume = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(volume24h);

    return (
        <div className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg
            ${isFixed 
                ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30' 
                : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50'
            }
            ${priceAnimation === 'up' ? 'ring-2 ring-green-400/50' : ''}
            ${priceAnimation === 'down' ? 'ring-2 ring-red-400/50' : ''}
        `}>
            {/* Fixed Badge */}
            {isFixed && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/80 text-blue-100 text-xs font-medium rounded-full">
                        <Zap className="w-3 h-3" />
                        SABIT
                    </div>
                </div>
            )}

            {/* Price Change Animation Overlay */}
            <div className={`
                absolute inset-0 transition-opacity duration-1000 pointer-events-none
                ${priceAnimation === 'up' ? 'bg-green-400/5 opacity-100' : ''}
                ${priceAnimation === 'down' ? 'bg-red-400/5 opacity-100' : ''}
                ${!priceAnimation ? 'opacity-0' : ''}
            `} />

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Crypto Icon */}
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${symbol === 'BTC' ? 'bg-orange-500/20 text-orange-400' : ''}
                            ${symbol === 'ETH' ? 'bg-blue-500/20 text-blue-400' : ''}
                            ${symbol !== 'BTC' && symbol !== 'ETH' ? 'bg-gray-500/20 text-gray-400' : ''}
                        `}>
                            {symbol === 'BTC' ? '₿' : symbol === 'ETH' ? 'Ξ' : symbol.charAt(0)}
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold text-white">{symbol}</h3>
                            <p className="text-sm text-gray-400">{name}</p>
                        </div>
                    </div>

                    {/* Live Price Animation */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">CANLI</span>
                    </div>
                </div>

                {/* Current Price */}
                <div className="mb-4">
                    <div className={`
                        text-3xl font-bold transition-all duration-300
                        ${priceAnimation === 'up' ? 'text-green-400 scale-105' : ''}
                        ${priceAnimation === 'down' ? 'text-red-400 scale-105' : ''}
                        ${!priceAnimation ? 'text-white' : ''}
                    `}>
                        {formattedPrice}
                    </div>
                </div>

                {/* 24h Change */}
                <div className="flex items-center gap-2 mb-4">
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`
                        text-sm font-semibold
                        ${isPositive ? 'text-green-500' : 'text-red-500'}
                    `}>
                        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-500">24s</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400">Hacim 24s</span>
                        </div>
                        <div className="text-sm font-semibold text-white">
                            ${formattedVolume}
                        </div>
                    </div>

                    {high24h && low24h && (
                        <div className="bg-gray-800/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-gray-400">24s Aralık</span>
                            </div>
                            <div className="text-xs text-gray-300">
                                <div className="text-green-400">${high24h.toLocaleString()}</div>
                                <div className="text-red-400">${low24h.toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Market Cap */}
                {marketCap && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-gray-400">Piyasa Değeri</span>
                        </div>
                        <div className="text-sm font-semibold text-white">
                            ${new Intl.NumberFormat('en-US', { 
                                notation: 'compact', 
                                maximumFractionDigits: 1 
                            }).format(marketCap)}
                        </div>
                    </div>
                )}

                {/* Fixed Indicator */}
                {isFixed && (
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-medium">
                                Ana Takip Coinimiz
                            </span>
                        </div>
                        <p className="text-xs text-blue-200/70 mt-1">
                            Bu coin sürekli takip ediliyor ve analiz ediliyor
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CryptoPriceCard;
