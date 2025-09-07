# 🚀 Kripto Sinyal Analiz Botu

## 📋 Proje Özeti
AI destekli kripto para sinyal analiz sistemi. KuCoin API kullanarak gerçek zamanlı piyasa analizi yapar ve akıllı sinyal üretir.

## 🎯 Ana Özellikler

### 📊 Teknik Analiz
- **Zaman Çerçeveleri**: 15dk, 1s, 4s, 1gün analizi
- **Her 5 dakikada**: 15 dakikalık grafikleri analiz eder
- **Onay Sistemi**: 1 saatlik zaman çerçevesinde doğrulama
- **Market Cap Filtresi**: 50M$ üzeri coinleri tarar

### 🔧 Teknik İndikatörler

#### Hızlı Sinyaller (Ana)
- ADX (Average Directional Index)
- Aroon Oscillator  
- SMC (Smart Money Concepts)
- Bollinger Bands (BB)
- Price Change Channels
- Momentum İndikatörleri

#### Destekleyici İndikatörler
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- EMA (Exponential Moving Average)

### 💡 Sinyal Sistemi
- **Long/Short Sinyalleri**
- **Risk Yönetimi**: Stop Loss + 3 Take Profit seviyesi
- **Giriş Seviyeleri**: Net giriş noktaları
- **Güven Skorları**: Her sinyal için güvenilirlik oranı

### 🤖 Yapay Zeka Özellikleri
- **Öğrenme Sistemi**: Başarılı/başarısız sinyallerden öğrenir
- **Tahmin Motoru**: Gelecek saatler için tahminler
- **Piyasa Analizi**: Pump/dump nedenlerini analiz eder
- **Momentum Takibi**: Hacim ve kırılım analizleri

### 📈 Destek/Direnç Sistemi
- **Saatlik Seviyeleri**: Dinamik S/R hesaplaması
- **Likidite Alanları**: Önemli fiyat bölgeleri
- **Kırılım Bildirimleri**: Gerçek zamanlı uyarılar

### 🔔 Bildirim Sistemi
- **Anlık Uyarılar**: Pump/dump bildirimleri
- **Neden Analizi**: "BTC pump geldi - Direnç kırıldı, hacim girdi"
- **Market Değişimleri**: Trend değişiklik bildirimleri

## 🛠️ Teknik Stack
- **Backend**: Node.js/Python
- **Frontend**: Next.js + TypeScript
- **API**: KuCoin Public API
- **Database**: MongoDB/PostgreSQL
- **AI/ML**: TensorFlow/PyTorch
- **WebSocket**: Gerçek zamanlı veri

## 📁 Proje Yapısı
```
analiz/
├── frontend/          # Next.js web arayüzü
├── backend/           # API sunucusu
├── ai-engine/         # Yapay zeka modülleri
├── data-collector/    # KuCoin API entegrasyonu
├── signal-processor/  # Sinyal analiz motoru
├── notification/      # Bildirim sistemi
└── docs/             # Dokümantasyon
```

## 🚀 Geliştirme Aşamaları

### Faz 1: Temel Altyapı
- [ ] KuCoin API entegrasyonu
- [ ] OHLCV veri toplama sistemi
- [ ] Temel teknik analiz motoru
- [ ] Basit web arayüzü

### Faz 2: Analiz Sistemi
- [ ] Tüm teknik indikatörlerin implementasyonu
- [ ] Çoklu zaman çerçevesi analizi
- [ ] Sinyal üretim algoritmaları
- [ ] Risk yönetim sistemi

### Faz 3: AI Integration
- [ ] Makine öğrenmesi modeli
- [ ] Sinyal başarı takip sistemi
- [ ] Öğrenme ve optimizasyon
- [ ] Tahmin motoru

### Faz 4: Gelişmiş Özellikler
- [ ] Destek/direnç otomatik tespiti
- [ ] Market sentiment analizi
- [ ] Gelişmiş bildirim sistemi
- [ ] Portfolio takip özelliği

## 🎯 Hedef Kullanıcılar
- Kripto yatırımcıları
- Day traderlar
- Swing traderlar
- Portföy yöneticileri

---
*Bu proje sürekli geliştirilmekte ve güncellenecektir.* 