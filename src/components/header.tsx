'use client';

import { useState } from 'react';
import { Bot, Menu, X, Activity, TestTube } from 'lucide-react';

interface HeaderProps {
  demoMode: boolean;
  onToggleDemo: () => void;
}

export function Header({ demoMode, onToggleDemo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kucoin Signal Bot</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Long/Short Trading Signals</p>
            </div>
          </div>

          {/* Status indicators and controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onToggleDemo}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                demoMode 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TestTube className="w-4 h-4" />
              <span>{demoMode ? 'Demo Mode' : 'Live Mode'}</span>
            </button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              demoMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              <Activity className="w-4 h-4" />
              <span>{demoMode ? 'Demo' : 'Live'}</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-2">
            <button
              onClick={onToggleDemo}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
                demoMode 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <TestTube className="w-4 h-4" />
              <span>{demoMode ? 'Demo Mode' : 'Live Mode'}</span>
            </button>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-fit ${
              demoMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              <Activity className="w-4 h-4" />
              <span>{demoMode ? 'Demo Data' : 'Live Trading Signals'}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}