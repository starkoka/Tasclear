const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const db = require('../functions/db.js');
const help = require("../functions/help");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('add-room')
            .setDMPermission(false)
            .setDefaultMemberPermissions(1<<3)
            .setDescription('VCを登録します')
            .addChannelOption(option =>
                option
                    .setName('チャンネル')
                    .setDescription('登録するVCを指定します')
                    .setRequired(true)
            ),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            const channel = interaction.options.getChannel('チャンネル');
            if(channel.type !== 2){
                await interaction.editReply({content: "チャンネルオプションにはVCを指定してください。"});
            }
            else{
                await db.updateOrInsert("main","VC",{"channelId":channel.id},{"channelId":channel.id,"type":false,guildId:channel.guildId});
                await interaction.editReply({content: `<#${channel.id}>をルームに登録しました`});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('del-room')
            .setDMPermission(false)
            .setDefaultMemberPermissions(1<<3)
            .setDescription('VCの登録を解除します')
            .addChannelOption(option =>
                option
                    .setName('チャンネル')
                    .setDescription('登録解除するVCを指定します')
                    .setRequired(true)
            ),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            const channel = interaction.options.getChannel('チャンネル');
            if(channel.type !== 2){
                await interaction.editReply({content: "チャンネルオプションにはVCを指定してください。"});
            }
            else{
                await db.delete("main","VC",{"channelId":channel.id});
                await interaction.editReply({content: `<#${channel.id}>のルーム登録を解除しました`});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('room-list')
            .setDMPermission(false)
            .setDescription('このサーバーのルーム一覧を表示します'),
        async execute(interaction) {
            await interaction.deferReply();
            const channels = await db.find("main","VC",{"guildId":interaction.guildId});
            const guild = client.guilds.cache.get(interaction.guildId) ?? await client.guilds.fetch(interaction.guildId);
            const field=[];
            if(channels.length > 0) {
                for(let i=0;i<channels.length;i++) {
                    field.push({
                        name:`<#${channels[i].channelId}>`,
                        value:`タイプ：作業ルーム`
                    });
                }
            }
            else{
                field.push({
                    name:`未登録`,
                    value:`登録されているルームはありません`
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x3CDE99)
                .setTitle(`ルーム一覧`)
                .setAuthor({
                    name: "たすくりあ",
                    iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
                    url: 'https://github.com/starkoka/Tasclear/'
                })
                .setDescription(`${guild.name} に登録されているルーム一覧です。`)
                .addFields(field)
                .setTimestamp();

            await interaction.editReply({embeds: [embed]});
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('news-set')
            .setDescription('BOTからのお知らせを受け取るチャンネルを指定します')
            .setDefaultMemberPermissions(1<<3)
            .setDMPermission(false)
            .addChannelOption(option =>
                option
                    .setName('チャンネル')
                    .setDescription('チャンネルを指定します(未指定で解除されます)')
                    .setRequired(false)
            ),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            if(interaction.options.getChannel('チャンネル')){
                const channel = interaction.options.getChannel('チャンネル');
                if(channel.type !== 0   ){
                    await interaction.editReply({content: "チャンネルオプションにはテキストチャンネルを指定してください。"});
                }
                else{
                    await db.update("main","guild",{guildId:interaction.guild.id},{
                        $set:{
                            newsId:interaction.options.getChannel('チャンネル').id
                        }
                    });
                    await interaction.editReply("登録しました");
                }
            }
            else{
                await db.update("main","guild",{guildId:interaction.guild.id},{
                    $set:{
                        newsId:null
                    }
                });
                await interaction.editReply("登録を解除しました");
            }
        },
    },
]