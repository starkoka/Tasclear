const { SlashCommandBuilder, EmbedBuilder, version} = require('discord.js');
const packageVer = require('../package.json');
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
    {
        data: new SlashCommandBuilder()
            .setName('about')
            .setDescription('このBOTの概要を表示します'),
        async execute(interaction){
            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle('StudyRoom BOT概要')
                .setAuthor({
                    name: 'StudyRoom BOT',
                    iconURL: 'https://cdn.discordapp.com/attachments/1124343762429149185/1140352970316329001/ddf123f4cea91ab5.png',
                    url: 'https://github.com/starkoka/StudyRoom-BOT'
                })
                .setDescription('このbotの概要を紹介します')
                .addFields(
                    [
                        {
                            name: 'バージョン情報',
                            value: `v${packageVer.version}`,
                        },
                        {
                            name: 'ソースコード',
                            value: 'このBOTは、オープンソースとなっています。[GitHub](https://github.com/starkoka/StudyRoom-BOT)にて公開されています。\n'
                        },
                        {
                            name: 'バグの報告先',
                            value: "[Issue](https://github.com/starkoka/StudyRoom-BOT/issues)までバグの報告をお願いします。\nサポート等の詳細は`/help`や`/admin-help`を実行してください。\n"
                        },
                        {
                            name: '実行環境',
                            value: `node.js v${process.versions.node} \ndiscord.js v${version} \n\nDocker v24.0.2\nMongoDB 6.0 Powered by Google Cloud`
                        },
                    ]
                )
                .setTimestamp()
                .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' })
            await interaction.reply({ embeds: [embed ]})
        },
    },
]