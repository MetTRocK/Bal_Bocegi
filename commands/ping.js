const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ping',
    description: 'Bot\'un ping değerini gösterir',
    usage: 'z_ping',
    category: 'Genel',
    
    execute(message, args, client) {
        const sent = Date.now();
        
        message.reply('🏓 Pong! Hesaplanıyor...').then(sentMessage => {
            const timeTaken = Date.now() - sent;
            
            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('🏓 Pong!')
                .addFields(
                    {
                        name: 'Bot Gecikmesi',
                        value: `${timeTaken}ms`,
                        inline: true
                    },
                    {
                        name: 'API Gecikmesi',
                        value: `${Math.round(client.ws.ping)}ms`,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: config.bot.name });
            
            sentMessage.edit({ content: '', embeds: [embed] });
        });
    }
};