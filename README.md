# 🐝 Bal Böceği Discord Bot

Bu proje, Discord sunucuları için geliştirilmiş özelleştirilebilir bir bot'tur.

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Discord Bot Token

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Discord Bot Token alın:**
   - [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
   - Yeni bir uygulama oluşturun
   - Bot sekmesinden bot token'ını kopyalayın

3. **Ortam değişkenlerini ayarlayın:**
   - `.env` dosyasını açın
   - `DISCORD_TOKEN=your_discord_bot_token_here` kısmındaki `your_discord_bot_token_here` yerine bot token'ınızı yazın

4. **Bot'u davet edin:**
   - Discord Developer Portal'da OAuth2 > URL Generator'a gidin
   - Scopes: `bot` ve `applications.commands` seçin
   - Bot Permissions: İhtiyacınız olan izinleri seçin
   - Oluşturulan URL ile bot'u sunucunuza davet edin

## 🎮 Kullanım

### Bot'u başlatın:
```bash
npm start
```

### Geliştirme modu (otomatik yeniden başlatma):
```bash
npm run dev
```

## 📋 Mevcut Komutlar

### 🏠 Genel
- `z_help` - Modern yardım menüsünü gösterir
- `z_ping` - Bot'un ping değerini test eder
- `z_info` - Bot hakkında detaylı bilgi gösterir

### 🎮 Eğlence
- `z_zar [adet]` - Rastgele zar atar (1-6 arası)

### 🔧 Yardımcı
- `z_avatar [@kullanıcı]` - Kullanıcının avatar resmini gösterir

> **Not:** Prefix `z_` olarak ayarlanmıştır. Örnek: `z_help`

## 🛠️ Özelleştirme

Bot'u özelleştirmek için `index.js` dosyasını düzenleyebilirsiniz. Yeni komutlar eklemek, event handler'lar oluşturmak ve bot davranışlarını değiştirmek mümkündür.

## 📁 Proje Yapısı

```
Bal_Bocegi/
├── index.js          # Ana bot dosyası
├── package.json      # Proje bağımlılıkları
├── .env             # Ortam değişkenleri (GİZLİ)
├── .gitignore       # Git ignore kuralları
└── README.md        # Bu dosya
```

## 🔒 Güvenlik

- Bot token'ınızı asla paylaşmayın
- `.env` dosyası Git'e yüklenmez (`.gitignore` ile korunur)
- Bot izinlerini minimum gereksinimle sınırlayın

## 📞 Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**Not:** Bu bot temel bir yapıdır ve ihtiyaçlarınıza göre genişletilebilir.