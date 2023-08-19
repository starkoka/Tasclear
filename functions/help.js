const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');

//helpTextの生成
const helpText = require("../text/helpText.json");
const adminTable = [];
for(let i=0;i < helpText.admin.length;i++){
    adminTable.push(
        new StringSelectMenuOptionBuilder()
            .setLabel(helpText.admin[i].value.title)
            .setDescription(helpText.admin[i].shortDescription)
            .setValue(String(i))
    )
}
const helpTable = [];
for(let i=0;i < helpText.help.length;i++){
    helpTable.push(
        new StringSelectMenuOptionBuilder()
            .setLabel(helpText.help[i].value.title)
            .setDescription(helpText.help[i].shortDescription)
            .setValue(String(i))
    )
}

exports.adminHelpSend = async function func(user) {
    const embed = new EmbedBuilder()
        .setColor(0x3CDE99)
        .setTitle(`管理者向けヘルプ`)
        .setAuthor({
            name: "たすくりあ",
            iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
            url: 'https://github.com/starkoka/Tasclear/'
        })
        .setDescription("たすくりあをご利用いただきありがとうございます。\n管理者向けのヘルプでは、主に以下に記載した管理者向けのBOTの情報や機能についての説明があります。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプを読めます。\n")
        .setTimestamp();

    const select = new StringSelectMenuBuilder()
        .setCustomId('adminHelp')
        .setPlaceholder('読みたいページを選択')
        .addOptions(adminTable);
    const row = new ActionRowBuilder()
        .addComponents(select);

    try{
        await user.send({embeds: [embed],components: [row]});
    }
    catch (error){
        await system.error("DMを送れませんでした。ブロックされている等ユーザー側が原因の場合もあります。",error,"DirectMessageエラー")
    }
}

exports.adminHelpDisplay = async function func(interaction) {
    const page = parseFloat(interaction.values[0]);
    const newEmbed = new EmbedBuilder()
        .setColor(0x3CDE99)
        .setTitle(`管理者向けヘルプ - ${helpText.admin[page].value.title}`)
        .setAuthor({
            name: "たすくりあ",
            iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
            url: 'https://github.com/starkoka/Tasclear/'
        })
        .setDescription(helpText.admin[page].value.description)
        .addFields(helpText.admin[page].value.field)
        .setTimestamp();
    try{
        await interaction.update({embeds: [newEmbed]});
    }
    catch (error){
        await system.error("DMを編集できませんでした。ブロックされている等ユーザー側が原因の場合もあります。",error,"DirectMessageエラー")
    }
}

exports.helpSend = async function func(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x3CDE99)
        .setTitle(`ヘルプ`)
        .setAuthor({
            name: "たすくりあ",
            iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
            url: 'https://github.com/starkoka/Tasclear/'
        })
        .setDescription("たすくりあをご利用いただきありがとうございます。\nヘルプでは、このBOTの機能の使い方等を確認できます。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプを読めます。\n")
        .setTimestamp();

    const select = new StringSelectMenuBuilder()
        .setCustomId('help')
        .setPlaceholder('読みたいページを選択')
        .addOptions(helpTable);
    const row = new ActionRowBuilder()
        .addComponents(select);

    await interaction.reply({embeds: [embed],components: [row]});
}

exports.helpDisplay = async function func(interaction) {
    const page = parseFloat(interaction.values[0]);
    const newEmbed = new EmbedBuilder()
        .setColor(0x3CDE99)
        .setTitle(`ヘルプ - ${helpText.help[page].value.title}`)
        .setAuthor({
            name: "たすくりあ",
            iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
            url: 'https://github.com/starkoka/Tasclear/'
        })
        .setDescription(helpText.help[page].value.description)
        .addFields(helpText.help[page].value.field)
        .setTimestamp();
    await interaction.update({embeds: [newEmbed]});
}