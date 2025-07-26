const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'info',
    aliases: ['bilgi', 'about', 'hakkında'],
    description: 'Bot hakkında detaylı bilgi gösterir',
    usage: 'z_info',
    category: 'Genel',
    
    execute(message, args, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ 
                name: config.bot.name,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle(`${config.emojis.bee} Bot Bilgileri`)
            .setDescription(`**${config.bot.name}** - ${config.bot.description}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '📊 İstatistikler',
                    value: `• **Sunucular:** ${client.guilds.cache.size}\n• **Kullanıcılar:** ${client.users.cache.size}\n• **Kanallar:** ${client.channels.cache.size}`,
                    inline: true
                },
                {
                    name: '⚙️ Teknik Bilgiler',
                    value: `• **Versiyon:** v${config.bot.version}\n• **Node.js:** ${process.version}\n• **Discord.js:** v14.x`,
                    inline: true
                },
                {
                    name: '⏱️ Çalışma Süresi',
                    value: `${days}g ${hours}s ${minutes}d ${seconds}sn`,
                    inline: true
                },
                {
                    name: '🔧 Özellikler',
                    value: '• Modern komut sistemi\n• Kategorize edilmiş yardım menüsü\n• Hata yakalama sistemi\n• Modüler yapı',
                    inline: false
                },
                {
                    name: '👨‍💻 Geliştirici',
                    value: 'Bu bot Discord.js v14 kullanılarak geliştirilmiştir.',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} • Prefix: ${config.bot.prefix}`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        message.reply({ embeds: [embed] });
    }
};