const { SlashCommandBuilder} = require('discord.js')
const help = require('../functions/help.js')
const db = require('../functions/db.js');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('このBOTのpingを測定します'),
        async execute(interaction) {
            await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('このBOTのヘルプを表示します'),
        async execute(interaction) {
            await help.helpSend(interaction);
        },
    },

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
            await interaction.deferReply();
            const channel = interaction.options.getChannel('チャンネル');
            if(channel.type !== 2){
                await interaction.editReply({content: "チャンネルオプションにはVCを指定してください。",ephemeral: true});
            }
            else{
                await db.updateOrInsert("main","VC",{"channelId":channel.id},{"channelId":channel.id,"type":false,guildId:channel.guildId});
                await interaction.editReply({content: "登録しました",ephemeral: true});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('admin-help')
            .setDescription('管理者向けメニューをDMで表示します。')
            .setDefaultMemberPermissions(1<<3)
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.reply({ content: "DMに管理者向けメニューを送信しました。受信できていない場合、以下に該当していないかどうかご確認ください。\n・このサーバー上の他のメンバーからのDMをOFFにしている\n・フレンドからのDMのみを許可している\n・このBOTをブロックしている", ephemeral: true });
            await help.adminHelpSend(interaction.user);
        },
    },
]