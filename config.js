module.exports = {
    // Bot ayarları
    bot: {
        prefix: process.env.BOT_PREFIX || 'z_',
        name: process.env.BOT_NAME || 'Bal Böceği',
        version: '1.0.0',
        description: 'Discord sunucuları için özelleştirilebilir bot'
    },
    
    // Renk kodları (embed'ler için)
    colors: {
        primary: 0x3F1D2E,    // Koyu mor
        success: 0x00FF00,    // Yeşil
        error: 0xFF0000,      // Kırmızı
        warning: 0xFFA500,    // Turuncu
        info: 0x3F1D2E        // Koyu mor
    },
    
    // Emoji'ler
    emojis: {
        bee: '🐝',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        ping: '🏓',
        wave: '👋'
    },
    
    // Bot durumları
    activities: [
        { name: 'Bal Böceği 🐝', type: 'WATCHING' },
        { name: 'Discord sunucusunu', type: 'WATCHING' },
        { name: '!yardım komutunu', type: 'LISTENING' }
    ],
    
    // Geliştirici ayarları
    dev: {
        debug: process.env.NODE_ENV === 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
    }
};