const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder,EmbedBuilder, ActionRowBuilder} = require("discord.js");
const {client} = require("../main");


const adminHelpTxt = [
    {
        title: '管理者向けコマンド',
        description:'管理者向けコマンドの一覧です。管理者のみが実行可能となっていて、管理者権限を持っていないユーザーは一覧にも表示されません。\n',
        field:[
            {
                name:"/adminhelp",
                value:"管理者向けヘルプをDMで表示します。\n"
            }, {
                name:"/addchan",
                value:"VCを自習室に登録します。これを実行したVCは自習室となり、参加時間が記録されるようになります。\n"
            }, {
                name:"/delchan",
                value:"VCを自習室から削除します。これを実行したVCでは、参加時間が記録されません。\n"
            }
        ],
    },
    {
        title: 'BOTの運営とサポート',
        description:'BOTの運営とサポートは、下記のとおりです。\n',
        field:[
            {
                name:"ソースコード",
                value:"管理者向けヘルプをDMで表示します。\n"
            }, {
                name:"あー",
                value:"ほげあー\n"
            }, {
                name:"いー",
                value:"ほげいー\n"
            }
        ],
    }
]



exports.adminHelpSend = async function func(user) {
    let page = 0,flag = 0;
    let embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(`管理者向けヘルプ`)
        .setAuthor({
            name: "StudyRoom BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/starkoka/StudyRoom-BOT'
        })
        .setDescription("StudyRoom BOTをご利用いただきありがとうございます。\n管理者向けのヘルプでは、主に以下に記載した管理者向けのBOTの情報や機能についての説明があります。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプが読めます。\n")
        .setTimestamp()
        .setFooter({ text: 'Developed by kokastar' });

    const select = new StringSelectMenuBuilder()
        .setCustomId('adminHelp')
        .setPlaceholder('読みたいページを選択')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('管理者向けコマンドについて')
                .setDescription('管理者向けコマンドの一覧です。')
                .setValue('0'),
            new StringSelectMenuOptionBuilder()
                .setLabel('このBOTの運営とサポートについて')
                .setDescription('BOTの運営とサポートについてです。運営情報や、不具合・要望などはここから。')
                .setValue('1'),
        );

    const row = new ActionRowBuilder()
        .addComponents(select);

    await user.send({embeds: [embed],components: [row]});
}

exports.adminHelpDisplay = async function func(interaction) {
    let page = parseFloat(interaction.values[0]);
    let newEmbed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(`管理者向けヘルプ : ${adminHelpTxt[page].title}`)
        .setAuthor({
            name: "StudyRoom BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/starkoka/StudyRoom-BOT'
        })
        .setDescription(adminHelpTxt[page].description)
        .addFields(adminHelpTxt[page].field)
        .setTimestamp()
        .setFooter({text: 'Developed by kokastar'}
        )
    //await client.channels.cache.get(interaction.message.id).send.edit({embeds: [newEmbed]}); チャンネルじゃない
}