const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'zar',
    aliases: ['dice', 'roll', 'zarla'],
    description: 'Rastgele zar atar (1-6 arası)',
    usage: 'z_zar [adet]',
    category: 'Eğlence',
    
    execute(message, args, client) {
        let diceCount = 1;
        
        // Zar sayısını kontrol et
        if (args[0]) {
            const count = parseInt(args[0]);
            if (count && count > 0 && count <= 10) {
                diceCount = count;
            } else if (count > 10) {
                return message.reply(`${config.emojis.error} En fazla 10 zar atabilirsin!`);
            }
        }
        
        const results = [];
        let total = 0;
        
        for (let i = 0; i < diceCount; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            results.push(roll);
            total += roll;
        }
        
        const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const resultText = results.map(r => diceEmojis[r]).join(' ');
        
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎲 Zar Atma Sonucu')
            .setDescription(`${message.author} zar attı!`)
            .addFields(
                {
                    name: '🎯 Sonuç',
                    value: resultText,
                    inline: false
                },
                {
                    name: '📊 Detaylar',
                    value: `**Zar Sayısı:** ${diceCount}\n**Toplam:** ${total}\n**Ortalama:** ${(total / diceCount).toFixed(1)}`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: config.bot.name,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        // Özel durumlar
        if (diceCount === 1) {
            if (results[0] === 6) {
                embed.setDescription(`${message.author} zar attı ve **JACKPOT** ${config.emojis.success}`);
                embed.setColor(config.colors.success);
            } else if (results[0] === 1) {
                embed.setDescription(`${message.author} zar attı ama... ${config.emojis.warning}`);
                embed.setColor(config.colors.warning);
            }
        } else {
            // Çoklu zar için özel durumlar
            if (results.every(r => r === 6)) {
                embed.setDescription(`${message.author} **SÜPER JACKPOT!** Tüm zarlar 6! ${config.emojis.success}`);
                embed.setColor(config.colors.success);
            } else if (results.every(r => r === 1)) {
                embed.setDescription(`${message.author} **SÜPER KÖTÜ ŞANS!** Tüm zarlar 1! ${config.emojis.error}`);
                embed.setColor(config.colors.error);
            }
        }
        
        message.reply({ embeds: [embed] });
    }
};