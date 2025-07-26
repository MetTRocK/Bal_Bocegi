const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
require('dotenv').config();

// Bot client'ını oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Komutları yükle
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`✅ Komut yüklendi: ${command.name}`);
        } else {
            console.log(`⚠️ Komut dosyası eksik özellik içeriyor: ${filePath}`);
        }
    }
}

// Bot hazır olduğunda çalışacak event
client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Bot başarıyla giriş yaptı! ${readyClient.user.tag} olarak aktif.`);
    console.log(`📊 ${client.commands.size} komut yüklendi.`);
    
    // Bot durumunu ayarla
    const activity = config.activities[0];
    client.user.setActivity(activity.name, { type: activity.type });
    
    // Aktivite rotasyonu (isteğe bağlı)
    if (config.activities.length > 1) {
        let activityIndex = 0;
        setInterval(() => {
            activityIndex = (activityIndex + 1) % config.activities.length;
            const currentActivity = config.activities[activityIndex];
            client.user.setActivity(currentActivity.name, { type: currentActivity.type });
        }, 30000); // 30 saniyede bir değiştir
    }
});

// Mesaj event'i
client.on(Events.MessageCreate, async (message) => {
    // Bot'un kendi mesajlarını ignore et
    if (message.author.bot) return;
    
    // Prefix kontrolü
    if (!message.content.startsWith(config.bot.prefix)) {
        // Basit etkileşimler (prefix olmadan)
        if (message.content.toLowerCase().includes('merhaba') && message.mentions.has(client.user)) {
            message.reply(`Merhaba ${message.author}! ${config.emojis.bee} ${config.bot.name} burada!`);
        }
        return;
    }
    
    // Komutu parse et
    const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Komutu bul
    const command = client.commands.get(commandName) 
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) {
        return message.reply(`${config.emojis.error} Bilinmeyen komut! \`${config.bot.prefix}yardım\` yazarak komut listesini görebilirsin.`);
    }
    
    try {
        // Debug log
        if (config.dev.debug) {
            console.log(`🔧 Komut çalıştırılıyor: ${commandName} | Kullanıcı: ${message.author.tag}`);
        }
        
        // Komutu çalıştır
        await command.execute(message, args, client);
        
    } catch (error) {
        console.error(`❌ Komut hatası (${commandName}):`, error);
        
        const errorMessage = config.dev.debug 
            ? `\`\`\`${error.message}\`\`\``
            : 'Komut çalıştırılırken bir hata oluştu.';
            
        message.reply(`${config.emojis.error} ${errorMessage}`);
    }
});

// Hata yakalama
client.on('error', (error) => {
    console.error('❌ Bot hatası:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Yakalanmamış hata:', error);
});

// Bot'u başlat
client.login(process.env.DISCORD_TOKEN);

console.log('🚀 Bot başlatılıyor...');