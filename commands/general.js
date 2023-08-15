const { SlashCommandBuilder, EmbedBuilder, version} = require('discord.js');
const packageVer = require('../package.json');
const help = require('../functions/help.js');
const userData = require('../functions/userData.js');

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
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
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
    {
        data: new SlashCommandBuilder()
            .setName('studydata')
            .setDescription('ユーザーの勉強時間を表示します')
            .addIntegerOption(option =>
                option
                    .setName('期間')
                    .setDescription('確認したいデータの期間を指定してください')
                    .setRequired(false)
                    .addChoices(
                        { name: '今週', value: -1 },
                        { name: '先週', value: 0 },
                        { name: '2週間前', value: 1 },
                        { name: '3週間前', value: 2 },
                        { name: '直近4週間(週別データ)', value: -2},
                    )
            )
            .addUserOption(option =>
                option
                    .setName('ユーザー')
                    .setDescription('他の人の記録を見る場合に指定してください')
                    .setRequired(false)
            ),
        async execute(interaction) {
            await interaction.deferReply();
            const userId = interaction.options.getUser('ユーザー') ?? interaction.user.id;
            const type = interaction.options.getInteger('期間') ?? -1
            const embed = await userData.generateDataEmbed(userId,type);
            await interaction.editReply({embeds: [embed]});
        },
    },
]