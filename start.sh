#!/bin/bash

echo "🚀 Kripto Sinyal Analiz Botu - Başlatılıyor..."

# Environment variables (production'da .env dosyası kullanın)
export NODE_ENV=development
export PORT=5000
export FRONTEND_URL=http://localhost:3000
export LOG_LEVEL=info

# Renklendirme
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Bağımlılıkları kontrol et
check_dependencies() {
    print_status "Bağımlılıklar kontrol ediliyor..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js bulunamadı. Lütfen Node.js 18+ yükleyin."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm bulunamadı. Lütfen npm yükleyin."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18 veya üzeri gerekli. Mevcut: $(node --version)"
        exit 1
    fi
    
    print_success "Bağımlılıklar tamam (Node.js $(node --version))"
}

# Proje yapısını kontrol et
check_project_structure() {
    print_status "Proje yapısı kontrol ediliyor..."
    
    required_dirs=("backend" "frontend" "data-collector" "signal-processor")
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "$dir klasörü bulunamadı"
            exit 1
        fi
    done
    
    print_success "Proje yapısı tamam"
}

# Bağımlılıkları yükle
install_dependencies() {
    print_status "Bağımlılıklar yükleniyor..."
    
    # Ana proje
    if [ ! -d "node_modules" ]; then
        print_status "Ana proje bağımlılıkları yükleniyor..."
        npm install
    fi
    
    # Alt modüller
    modules=("backend" "frontend" "data-collector" "signal-processor")
    for module in "${modules[@]}"; do
        if [ ! -d "$module/node_modules" ]; then
            print_status "$module bağımlılıkları yükleniyor..."
            (cd $module && npm install)
        fi
    done
    
    print_success "Tüm bağımlılıklar yüklendi"
}

# Build işlemleri
build_project() {
    print_status "Proje build ediliyor..."
    
    # Backend build
    print_status "Backend build ediliyor..."
    (cd backend && npm run build)
    
    # Signal processor build
    print_status "Signal processor build ediliyor..."
    (cd signal-processor && npm run build)
    
    # Data collector build
    print_status "Data collector build ediliyor..."
    (cd data-collector && npm run build)
    
    print_success "Build işlemleri tamamlandı"
}

# Servis durumu kontrolü
check_ports() {
    print_status "Port durumu kontrol ediliyor..."
    
    if lsof -i:5000 &>/dev/null; then
        print_warning "Port 5000 kullanımda. Mevcut süreci durduruyor..."
        pkill -f "node.*5000" || true
    fi
    
    if lsof -i:3000 &>/dev/null; then
        print_warning "Port 3000 kullanımda. Mevcut süreci durduruyor..."
        pkill -f "next.*3000" || true
    fi
    
    print_success "Portlar hazır"
}

# Ana başlatma fonksiyonu
start_services() {
    print_status "Servisler başlatılıyor..."
    
    # Log klasörü oluştur
    mkdir -p backend/logs data-collector/logs
    
    # Backend servis
    print_status "Backend servisi başlatılıyor (Port: 5000)..."
    (cd backend && npm start &)
    BACKEND_PID=$!
    
    # Kısa bekle
    sleep 3
    
    # Data collector (arka planda)
    print_status "Data collector başlatılıyor..."
    (cd data-collector && npm start &)
    DATA_COLLECTOR_PID=$!
    
    # Frontend (geliştirme modu)
    print_status "Frontend servisi başlatılıyor (Port: 3000)..."
    (cd frontend && npm run dev &)
    FRONTEND_PID=$!
    
    print_success "Tüm servisler başlatıldı!"
    echo ""
    echo "📊 Servis Bilgileri:"
    echo "   🌐 Frontend:  http://localhost:3000"
    echo "   🔧 Backend:   http://localhost:5000"
    echo "   📡 API Docs:  http://localhost:5000/health"
    echo ""
    echo "📋 Process IDs:"
    echo "   Backend: $BACKEND_PID"
    echo "   Data Collector: $DATA_COLLECTOR_PID"  
    echo "   Frontend: $FRONTEND_PID"
    echo ""
    echo "🛑 Durdurmak için: Ctrl+C veya ./stop.sh"
    echo ""
    
    # PID'leri kaydet
    echo "$BACKEND_PID" > .backend.pid
    echo "$DATA_COLLECTOR_PID" > .data-collector.pid
    echo "$FRONTEND_PID" > .frontend.pid
}

# Sinyal yakalama (Ctrl+C)
cleanup() {
    print_warning "Servisler durduruluyor..."
    
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f .data-collector.pid ]; then
        kill $(cat .data-collector.pid) 2>/dev/null || true
        rm .data-collector.pid
    fi
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    
    print_success "Tüm servisler durduruldu"
    exit 0
}

# Ana akış
main() {
    echo "🎯 Kripto Sinyal Analiz Botu v1.0"
    echo "================================="
    
    # Sinyal yakalama
    trap cleanup SIGINT SIGTERM
    
    check_dependencies
    check_project_structure
    install_dependencies
    check_ports
    
    # Development mode - build gerek yok
    # build_project
    
    start_services
    
    # Sonsuz döngü (servisleri canlı tut)
    while true; do
        sleep 5
        
        # Sağlık kontrolü
        if ! ps -p $BACKEND_PID > /dev/null; then
            print_error "Backend servisi durdu!"
            break
        fi
        
        if ! ps -p $FRONTEND_PID > /dev/null; then
            print_error "Frontend servisi durdu!"
            break
        fi
    done
    
    cleanup
}

# Argüman kontrolü
case "${1:-start}" in
    "start")
        main
        ;;
    "dev")
        NODE_ENV=development main
        ;;
    "build")
        check_dependencies
        build_project
        ;;
    "install")
        check_dependencies
        install_dependencies
        ;;
    "help"|"-h"|"--help")
        echo "Kullanım: $0 [start|dev|build|install|help]"
        echo ""
        echo "Komutlar:"
        echo "  start    Servisleri başlat (varsayılan)"
        echo "  dev      Development modda başlat"
        echo "  build    Projeyi build et"
        echo "  install  Bağımlılıkları yükle"
        echo "  help     Bu yardımı göster"
        ;;
    *)
        print_error "Bilinmeyen komut: $1"
        echo "Yardım için: $0 help"
        exit 1
        ;;
esac
