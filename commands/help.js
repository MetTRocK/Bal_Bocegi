const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
            const commandButtons = this.createCommandButtons(client, commands);
            
            const response = await message.reply({ 
                embeds: [mainEmbed], 
                components: commandButtons 
            });
            
            // Button collector oluştur
            const collector = response.createMessageComponentCollector({
                time: 300000 // 5 dakika
            });
            
            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ 
                        content: '❌ Bu menüyü sadece komutu kullanan kişi kullanabilir!', 
                        ephemeral: true 
                    });
                }
                
                await interaction.deferUpdate();
                
                if (interaction.customId === 'back_to_main') {
                    // Ana menüye dön
                    const mainEmbed = this.createMainHelpEmbed(client, commands);
                    const commandButtons = this.createCommandButtons(client, commands);
                    
                    await interaction.editReply({ 
                        embeds: [mainEmbed], 
                        components: commandButtons 
                    });
                } else if (interaction.customId.startsWith('cmd_')) {
                    // Komutu çalıştır
                    const commandName = interaction.customId.replace('cmd_', '');
                    const command = commands.get(commandName);
                    
                    if (command) {
                        // Komutu çalıştır ve sonucunu göster
                        try {
                            await command.execute(message, [], client);
                            
                            // Komut çalıştırıldıktan sonra help menüsünü güncelle
                            const executedEmbed = this.createExecutedCommandEmbed(command, client);
                            const backButton = this.createBackButton();
                            
                            await interaction.editReply({ 
                                embeds: [executedEmbed], 
                                components: [backButton] 
                            });
                        } catch (error) {
                            console.error(`Komut çalıştırma hatası (${commandName}):`, error);
                            const errorEmbed = this.createErrorEmbed(commandName, client);
                            const backButton = this.createBackButton();
                            
                            await interaction.editReply({ 
                                embeds: [errorEmbed], 
                                components: [backButton] 
                            });
                        }
                    }
                }
            });
            
            collector.on('end', () => {
                // Collector bittiğinde butonları devre dışı bırak
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('⏰ Süre Doldu')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                            .setCustomId('expired')
                    );
                
                response.edit({ components: [disabledRow] }).catch(() => {});
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

        // İstatistikler
        embed.addFields(
            {
                name: '🔗 Faydalı Linkler',
                value: '• [Destek Sunucusu](https://discord.gg/example)\n• [Bot Davet Linki](https://discord.com/oauth2/authorize)\n• [GitHub Repo](https://github.com/example)',
                inline: true
            },
            {
                name: '📊 İstatistikler',
                value: `• **Sunucular:** ${client.guilds.cache.size}\n• **Kullanıcılar:** ${client.users.cache.size}\n• **Komutlar:** ${commands.size}`,
                inline: true
            }
        );
        
        return embed;
    },
    
    createCommandButtons(client, commands) {
        const rows = [];
        const commandButtons = [];
        
        // Her komut için buton oluştur
        commands.forEach(command => {
            const emoji = {
                'help': '❓',
                'ping': '🏓',
                'info': 'ℹ️',
                'zar': '🎲',
                'avatar': '🖼️'
            };
            
            commandButtons.push(
                new ButtonBuilder()
                    .setLabel(`${emoji[command.name] || '⚡'} ${command.name}`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`cmd_${command.name}`)
            );
        });
        
        // Butonları 5'erli gruplara böl
        for (let i = 0; i < commandButtons.length; i += 5) {
            const row = new ActionRowBuilder()
                .addComponents(commandButtons.slice(i, i + 5));
            rows.push(row);
        }
        
        return rows;
    },
    
    createCommandDetailEmbed(command, client) {
        const categoryEmoji = getCategoryEmoji(command.category || 'Diğer');
        
        const commandEmoji = {
            'help': '❓',
            'ping': '🏓',
            'info': 'ℹ️',
            'zar': '🎲',
            'avatar': '🖼️'
        };
        
        const embed = new EmbedBuilder()
            .setColor(config.colors.info)
            .setAuthor({ 
                name: 'Komut Detayları',
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle(`${commandEmoji[command.name] || '⚡'} ${config.bot.prefix}${command.name}`)
            .setDescription(`**📝 Açıklama:**\n${command.description || 'Bu komut için açıklama bulunmuyor.'}\n\n**🎯 Nasıl Kullanılır:**\n\`${command.usage || `${config.bot.prefix}${command.name}`}\``)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} • Komut Detayları`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        // Detaylı bilgiler
        embed.addFields(
            { 
                name: '📂 Kategori', 
                value: `${categoryEmoji} ${command.category || 'Diğer'}`, 
                inline: true 
            },
            { 
                name: '⚡ Durum', 
                value: '🟢 Aktif', 
                inline: true 
            }
        );
        
        if (command.aliases && command.aliases.length > 0) {
            embed.addFields({
                name: '🔄 Alternatif İsimler',
                value: command.aliases.map(alias => `\`${config.bot.prefix}${alias}\``).join(', '),
                inline: true
            });
        }
        
        // Komuta özel örnekler
        let examples = '';
        switch(command.name) {
            case 'ping':
                examples = '• `z_ping` - Bot pingini kontrol et';
                break;
            case 'info':
                examples = '• `z_info` - Bot bilgilerini görüntüle';
                break;
            case 'help':
                examples = '• `z_help` - Ana yardım menüsü\n• `z_help ping` - Ping komutu hakkında bilgi';
                break;
            default:
                examples = `• \`${command.usage || `${config.bot.prefix}${command.name}`}\``;
        }
        
        if (examples) {
            embed.addFields({
                name: '💡 Kullanım Örnekleri',
                value: examples,
                inline: false
            });
        }
        
        return embed;
    },
    
    createBackButton() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('⬅️ Ana Menüye Dön')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('back_to_main')
            );
    },
    
    createExecutedCommandEmbed(command, client) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.success || '#00ff00')
            .setAuthor({ 
                name: 'Komut Çalıştırıldı',
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle(`✅ ${command.name} komutu başarıyla çalıştırıldı!`)
            .setDescription(`**${command.name}** komutu başarıyla çalıştırıldı. Sonuçları yukarıda görebilirsiniz.`)
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} • Komut Çalıştırıldı`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        return embed;
    },
    
    createErrorEmbed(commandName, client) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error || '#ff0000')
            .setAuthor({ 
                name: 'Komut Hatası',
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle(`❌ ${commandName} komutu çalıştırılamadı!`)
            .setDescription(`**${commandName}** komutu çalıştırılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.`)
            .setTimestamp()
            .setFooter({ 
                text: `${config.bot.name} • Komut Hatası`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });
        
        return embed;
    }
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