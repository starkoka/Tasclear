const { SlashCommandBuilder} = require('discord.js');
const help = require('../functions/help.js');

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