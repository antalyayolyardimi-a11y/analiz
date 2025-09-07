#!/bin/bash

echo "🛑 Kripto Sinyal Analiz Botu - Durduruluyor..."

# Renklendirme
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# PID dosyalarından servisleri durdur
stop_services_by_pid() {
    print_status "PID dosyalarından servisler durduruluyor..."
    
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            print_status "Backend servisi durduruluyor (PID: $BACKEND_PID)"
            kill $BACKEND_PID
            sleep 2
            if ps -p $BACKEND_PID > /dev/null; then
                kill -9 $BACKEND_PID
            fi
        fi
        rm .backend.pid
    fi
    
    if [ -f .data-collector.pid ]; then
        DATA_COLLECTOR_PID=$(cat .data-collector.pid)
        if ps -p $DATA_COLLECTOR_PID > /dev/null; then
            print_status "Data collector durduruluyor (PID: $DATA_COLLECTOR_PID)"
            kill $DATA_COLLECTOR_PID
            sleep 2
            if ps -p $DATA_COLLECTOR_PID > /dev/null; then
                kill -9 $DATA_COLLECTOR_PID
            fi
        fi
        rm .data-collector.pid
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            print_status "Frontend servisi durduruluyor (PID: $FRONTEND_PID)"
            kill $FRONTEND_PID
            sleep 2
            if ps -p $FRONTEND_PID > /dev/null; then
                kill -9 $FRONTEND_PID
            fi
        fi
        rm .frontend.pid
    fi
}

# Port bazlı durdurma
stop_services_by_port() {
    print_status "Port bazlı servisler durduruluyor..."
    
    # Port 5000 (Backend)
    if lsof -i:5000 &>/dev/null; then
        print_status "Port 5000'de çalışan servisi durduruyor..."
        pkill -f "node.*5000" || true
    fi
    
    # Port 3000 (Frontend)  
    if lsof -i:3000 &>/dev/null; then
        print_status "Port 3000'de çalışan servisi durduruyor..."
        pkill -f "next.*3000" || true
    fi
    
    # Node.js süreçleri (proje klasörü bazlı)
    PWD_NAME=$(basename "$PWD")
    if [ "$PWD_NAME" = "analiz" ]; then
        print_status "Analiz projesi süreçleri durduruluyor..."
        pkill -f "analiz" || true
    fi
}

# Genel cleanup
cleanup_all() {
    print_status "Genel temizlik yapılıyor..."
    
    # Temp dosyalar
    rm -f .*.pid
    
    # Node.js süreçleri
    pkill -f "ts-node.*index.ts" || true
    pkill -f "nodemon" || true
    
    # Next.js süreçleri
    pkill -f "next dev" || true
}

# Ana durdurma fonksiyonu
main() {
    stop_services_by_pid
    sleep 1
    stop_services_by_port
    sleep 1
    cleanup_all
    
    print_success "Tüm servisler durduruldu!"
    
    # Son kontrol
    print_status "Son kontrol yapılıyor..."
    if lsof -i:5000 &>/dev/null || lsof -i:3000 &>/dev/null; then
        print_warning "Bazı portlar hala kullanımda olabilir"
        print_status "Manuel kontrol: lsof -i:5000 ve lsof -i:3000"
    else
        print_success "Tüm portlar temizlendi"
    fi
}

# Force stop seçeneği
if [ "$1" = "force" ] || [ "$1" = "-f" ]; then
    print_warning "Zorla durdurma modu aktif"
    pkill -9 -f "node" || true
    pkill -9 -f "next" || true
    cleanup_all
    print_success "Zorla durdurma tamamlandı"
else
    main
fi

echo "✅ Durdurma işlemi tamamlandı"
