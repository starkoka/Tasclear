const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const db = require('../functions/db.js');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('add-studyroom')
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
                await interaction.editReply({content: `<#${channel.id}>を自習室に登録しました`});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('del-studyroom')
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
                await interaction.editReply({content: `<#${channel.id}>の自習室登録を解除しました`});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('roomlist')
            .setDMPermission(false)
            .setDescription('このサーバーの自習室一覧を表示します'),
        async execute(interaction) {
            await interaction.deferReply();
            const channels = await db.find("main","VC",{"guildId":interaction.guildId});
            const guild = client.guilds.cache.get(interaction.guildId) ?? await client.guilds.fetch(interaction.guildId);
            const field=[];
            if(channels.length > 0) {
                for(let i=0;i<channels.length;i++) {
                    field.push({
                        name:`<#${channels[i].channelId}>`,
                        value:`タイプ：自習室`
                    });
                }
            }
            else{
                field.push({
                    name:`未登録`,
                    value:`登録されているチャンネルはありません`
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle(`自習室一覧`)
                .setAuthor({
                    name: "StudyRoom BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/starkoka/StudyRoom-BOT'
                })
                .setDescription(`${guild.name} に登録されている自習室一覧です。`)
                .addFields(field)
                .setTimestamp()
                .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' });

            await interaction.editReply({embeds: [embed]});
        },
    },
]