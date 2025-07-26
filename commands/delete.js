const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'delete',
    aliases: ['sil', 'temizle', 'clear'],
    description: 'Kanaldaki tüm mesajları siler (Yönetici yetkisi gerekir)',
    usage: 'z_delete',
    category: 'Moderasyon',
    
    async execute(message, args, client) {
        try {
            // Yetki kontrolü
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                const noPermEmbed = new EmbedBuilder()
                    .setColor(config.colors.error || '#ff0000')
                    .setTitle('❌ Yetkisiz Erişim')
                    .setDescription('Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısınız!')
                    .setTimestamp()
                    .setFooter({ 
                        text: config.bot.name,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    });
                
                return message.reply({ embeds: [noPermEmbed] });
            }

            // Bot yetkisi kontrolü
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
                const botNoPermEmbed = new EmbedBuilder()
                    .setColor(config.colors.error || '#ff0000')
                    .setTitle('❌ Bot Yetkisi Yetersiz')
                    .setDescription('Bu komutu kullanabilmem için **Mesajları Yönet** yetkisine sahip olmam gerekiyor!')
                    .setTimestamp()
                    .setFooter({ 
                        text: config.bot.name,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    });
                
                return message.reply({ embeds: [botNoPermEmbed] });
            }

            const channel = message.channel;
            
            // Onay mesajı
            const confirmEmbed = new EmbedBuilder()
                .setColor(config.colors.warning || '#ffaa00')
                .setTitle('⚠️ Mesaj Silme Onayı')
                .setDescription(`**${channel.name}** kanalındaki tüm mesajları silmek istediğinizden emin misiniz?\n\n⚠️ **Bu işlem geri alınamaz!**`)
                .addFields(
                    {
                        name: '📊 Kanal Bilgileri',
                        value: `• **Kanal:** ${channel.name}\n• **Tip:** ${channel.type === 0 ? 'Metin Kanalı' : 'Diğer'}\n• **ID:** ${channel.id}`,
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `${config.bot.name} • 60 saniye içinde yanıt verin`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                });

            const confirmMessage = await message.reply({ embeds: [confirmEmbed] });
            
            // Onay için reaksiyon ekle
            await confirmMessage.react('✅');
            await confirmMessage.react('❌');

            // Reaksiyon collector
            const filter = (reaction, user) => {
                console.log(`🔍 Reaksiyon algılandı: ${reaction.emoji.name} | Kullanıcı: ${user.tag} | Beklenen: ${message.author.tag}`);
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            const collector = confirmMessage.createReactionCollector({ 
                filter, 
                time: 60000, 
                max: 1 
            });

            collector.on('collect', async (reaction) => {
                console.log(`✅ Reaksiyon toplandı: ${reaction.emoji.name}`);
                if (reaction.emoji.name === '✅') {
                    // Mesajları silme işlemi başlat
                    const processingEmbed = new EmbedBuilder()
                        .setColor(config.colors.info || '#0099ff')
                        .setTitle('🔄 Mesajlar Siliniyor...')
                        .setDescription('Lütfen bekleyin, kanaldaki tüm mesajlar siliniyor...')
                        .setTimestamp()
                        .setFooter({ 
                            text: config.bot.name,
                            iconURL: client.user.displayAvatarURL({ dynamic: true })
                        });

                    await confirmMessage.edit({ embeds: [processingEmbed] });
                    await confirmMessage.reactions.removeAll();

                    try {
                        let deletedCount = 0;
                        let fetched;
                        
                        do {
                            fetched = await channel.messages.fetch({ limit: 100 });
                            if (fetched.size === 0) break;
                            
                            // 14 günden eski mesajları tek tek sil
                            const oldMessages = fetched.filter(msg => 
                                Date.now() - msg.createdTimestamp > 14 * 24 * 60 * 60 * 1000
                            );
                            
                            const newMessages = fetched.filter(msg => 
                                Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000
                            );

                            // Yeni mesajları toplu sil
                            if (newMessages.size > 0) {
                                await channel.bulkDelete(newMessages, true);
                                deletedCount += newMessages.size;
                            }

                            // Eski mesajları tek tek sil
                            for (const msg of oldMessages.values()) {
                                try {
                                    await msg.delete();
                                    deletedCount++;
                                    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit için bekleme
                                } catch (error) {
                                    console.log(`Mesaj silinemedi: ${error.message}`);
                                }
                            }
                            
                        } while (fetched.size >= 2);

                        // Başarı mesajı
                        const successEmbed = new EmbedBuilder()
                            .setColor(config.colors.success || '#00ff00')
                            .setTitle('✅ Mesajlar Başarıyla Silindi')
                            .setDescription(`**${channel.name}** kanalındaki **${deletedCount}** mesaj başarıyla silindi!`)
                            .addFields(
                                {
                                    name: '📊 Silme İstatistikleri',
                                    value: `• **Silinen Mesaj:** ${deletedCount}\n• **Kanal:** ${channel.name}\n• **İşlem Saati:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                                    inline: false
                                }
                            )
                            .setTimestamp()
                            .setFooter({ 
                                text: config.bot.name,
                                iconURL: client.user.displayAvatarURL({ dynamic: true })
                            });

                        await confirmMessage.edit({ embeds: [successEmbed] });
                        
                        // 5 saniye sonra bu mesajı da sil
                        setTimeout(async () => {
                            try {
                                await confirmMessage.delete();
                            } catch (error) {
                                console.log('Başarı mesajı silinemedi:', error.message);
                            }
                        }, 5000);

                    } catch (error) {
                        console.error('Mesaj silme hatası:', error);
                        
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colors.error || '#ff0000')
                            .setTitle('❌ Mesaj Silme Hatası')
                            .setDescription('Mesajlar silinirken bir hata oluştu. Lütfen bot yetkilerini kontrol edin.')
                            .addFields(
                                {
                                    name: '🔍 Hata Detayları',
                                    value: `\`\`\`${error.message}\`\`\``,
                                    inline: false
                                }
                            )
                            .setTimestamp()
                            .setFooter({ 
                                text: config.bot.name,
                                iconURL: client.user.displayAvatarURL({ dynamic: true })
                            });

                        await confirmMessage.edit({ embeds: [errorEmbed] });
                    }
                } else {
                    // İptal edildi
                    const cancelEmbed = new EmbedBuilder()
                        .setColor(config.colors.secondary || '#6c757d')
                        .setTitle('❌ İşlem İptal Edildi')
                        .setDescription('Mesaj silme işlemi iptal edildi.')
                        .setTimestamp()
                        .setFooter({ 
                            text: config.bot.name,
                            iconURL: client.user.displayAvatarURL({ dynamic: true })
                        });

                    await confirmMessage.edit({ embeds: [cancelEmbed] });
                    await confirmMessage.reactions.removeAll();
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    // Zaman aşımı
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(config.colors.secondary || '#6c757d')
                        .setTitle('⏰ Zaman Aşımı')
                        .setDescription('60 saniye içinde yanıt verilmediği için işlem iptal edildi.')
                        .setTimestamp()
                        .setFooter({ 
                            text: config.bot.name,
                            iconURL: client.user.displayAvatarURL({ dynamic: true })
                        });

                    await confirmMessage.edit({ embeds: [timeoutEmbed] });
                    await confirmMessage.reactions.removeAll();
                }
            });
            
        } catch (error) {
            console.error('Delete komutu hatası:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colors.error || '#ff0000')
                .setTitle('❌ Komut Hatası')
                .setDescription('Komut çalıştırılırken bir hata oluştu!')
                .setTimestamp()
                .setFooter({ 
                    text: config.bot.name,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                });
                
            await message.reply({ embeds: [errorEmbed] });
        }
    }
};