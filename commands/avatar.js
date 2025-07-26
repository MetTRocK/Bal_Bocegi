const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'avatar',
    aliases: ['av', 'pfp', 'profil'],
    description: 'Kullanıcının avatar resmini gösterir',
    usage: 'z_avatar [@kullanıcı]',
    category: 'Yardımcı',
    
    execute(message, args, client) {
        // Hedef kullanıcıyı belirle
        let targetUser = message.author;
        
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        } else if (args[0]) {
            // ID ile kullanıcı arama
            const userId = args[0].replace(/[<@!>]/g, '');
            const foundUser = client.users.cache.get(userId);
            if (foundUser) {
                targetUser = foundUser;
            }
        }
        
        const avatarURL = targetUser.displayAvatarURL({ 
            dynamic: true, 
            size: 4096 
        });
        
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ 
                name: `${targetUser.username} - Avatar`,
                iconURL: avatarURL
            })
            .setTitle('🖼️ Profil Resmi')
            .setDescription(`**${targetUser.username}** kullanıcısının avatar resmi`)
            .setImage(avatarURL)
            .addFields(
                {
                    name: '👤 Kullanıcı Bilgileri',
                    value: `**İsim:** ${targetUser.username}\n**Tag:** ${targetUser.tag}\n**ID:** ${targetUser.id}`,
                    inline: true
                },
                {
                    name: '🔗 Avatar Linkleri',
                    value: `[PNG](${targetUser.displayAvatarURL({ format: 'png', size: 4096 })}) • [JPG](${targetUser.displayAvatarURL({ format: 'jpg', size: 4096 })}) • [WEBP](${targetUser.displayAvatarURL({ format: 'webp', size: 4096 })})`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} • Avatar görüntüleyici`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        // Eğer kullanıcının GIF avatarı varsa belirt
        if (avatarURL.includes('.gif')) {
            embed.addFields({
                name: '✨ Özel',
                value: 'Bu kullanıcının animasyonlu (GIF) avatarı var!',
                inline: false
            });
        }
        
        // Hesap oluşturma tarihi
        const accountCreated = Math.floor(targetUser.createdTimestamp / 1000);
        embed.addFields({
            name: '📅 Hesap Oluşturma',
            value: `<t:${accountCreated}:F>\n(<t:${accountCreated}:R>)`,
            inline: false
        });
        
        message.reply({ embeds: [embed] });
    }
};