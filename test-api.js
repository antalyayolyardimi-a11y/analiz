import axios from 'axios';

// Basit KuCoin API testi
async function testKuCoinAPI() {
  try {
    console.log('🔍 KuCoin API test ediliyor...');
    
    // Market ticker verilerini çek
    const response = await axios.get('https://api.kucoin.com/api/v1/market/allTickers');
    
    if (response.data.code === '200000') {
      const tickers = response.data.data.ticker;
      const usdtPairs = tickers
        .filter(t => t.symbol.endsWith('-USDT') && parseFloat(t.volValue) > 50000000)
        .slice(0, 10);
      
      console.log(`✅ Başarılı! ${tickers.length} total ticker, ${usdtPairs.length} büyük USDT çifti`);
      console.log('\n📊 İlk 5 yüksek hacimli coin:');
      
      usdtPairs.forEach((ticker, i) => {
        const symbol = ticker.symbol;
        const price = parseFloat(ticker.last);
        const change = (parseFloat(ticker.changeRate) * 100).toFixed(2);
        const volume = (parseFloat(ticker.volValue) / 1000000).toFixed(1);
        
        console.log(`${i+1}. ${symbol}: $${price} (${change}%) - Vol: $${volume}M`);
      });
      
    } else {
      console.log('❌ API Hatası:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testKuCoinAPI();
