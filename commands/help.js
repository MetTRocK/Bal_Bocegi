const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    aliases: ['yardım', 'h', 'commands', 'komutlar'],
    description: 'Tüm komutları modern bir arayüzle listeler',
    usage: 'z_help [komut_adı]',
    category: 'Genel',
    
    async execute(message, args, client) {
        try {
            const { commands } = client;
            
            // Ana yardım menüsü oluştur
            const mainEmbed = this.createMainHelpEmbed(client, commands);
            
            await message.reply({ 
                embeds: [mainEmbed]
            });
            
        } catch (error) {
            console.error('Help komutu hatası:', error);
            await message.reply('❌ Yardım menüsü yüklenirken bir hata oluştu!');
        }
    },
    
    createMainHelpEmbed(client, commands) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ 
                name: `${config.bot.name} Yardım Merkezi`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle('🌟 Komut Rehberi')
            .setDescription(`
                **Merhaba!** ${config.emojis.bee} Ben ${config.bot.name}, Discord sunucunuz için tasarlanmış modern bir botum.
                
                ╭─────────────────────────────╮
                │  **📋 Mevcut Komutlar**     │
                ╰─────────────────────────────╯
                
                💡 **İpucu:** Aşağıdaki komut isimlerine tıklayarak o komutu çalıştırabilirsiniz!
            `)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} v${config.bot.version} • Prefix: ${config.bot.prefix}`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });

        // Komutları kategorilere ayır
        const categories = new Map();
        
        commands.forEach(cmd => {
            const category = cmd.category || 'Diğer';
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(cmd);
        });

        // Her kategori için field ekle
        categories.forEach((cmds, categoryName) => {
            const categoryEmoji = getCategoryEmoji(categoryName);
            const commandList = cmds.map(cmd => {
                return `🔹 **${cmd.name}** - ${cmd.description || 'Açıklama yok'}`;
            }).join('\n');
            
            embed.addFields({
                name: `${categoryEmoji} ${categoryName}`,
                value: commandList || 'Henüz komut yok',
                inline: false
            });
        });

        // İstatistikler kaldırıldı
        
        return embed;
    },
    
    // Komut butonları kaldırıldı
    
    // Kullanılmayan fonksiyonlar kaldırıldı
};

// Kategori emojileri
function getCategoryEmoji(category) {
    const emojis = {
        'Genel': '🏠',
        'Moderasyon': '🛡️',
        'Eğlence': '🎮',
        'Müzik': '🎵',
        'Yardımcı': '🔧',
        'Ekonomi': '💰',
        'Diğer': '📦'
    };
    return emojis[category] || '📦';
}