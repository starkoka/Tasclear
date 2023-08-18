/** @format */

/** @typedef Goals
 *  @property {number} todayGoal 今日の目標時間[s]
 *  @property {number} thisWeekGoal 今週の目標時間[s]
 *  @property {number} dailyGoal 毎日の目標時間[s]
 *  @property {number} weeklyGoal 毎週の目標時間[s] */

/** @typedef TimedData
 *  @property {number} todayTotal 今日計測された時間の合計[s]
 *  @property {number} thisWeekTotal 今週計測された時間の合計[s]
 */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { find } = require("../functions/db.js");

/** Embedの生成
 * @param {string} userName 対象のユーザ名
 * @param {Goals} goals 目標時間
 * @param {{todayTotal: *, weeklyTotal: *}} timedData 計測された時間の合計
 * @return {EmbedBuilder} */
function makeEmbed(userName, goals, timedData) {
    return new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle(`${userName} さんの進捗データ`)
        .setAuthor(
            /** @type {import(discord.js).EmbedAuthorOptions} */ {
                name: "Tasclear",
                iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
                url: "https://github.com/starkoka/Tasclear",
            },
        )
        .setTimestamp();
}

module.exports = [
    {
        data: new SlashCommandBuilder().setName("studygoal").setDescription("設定した目標と現在の進捗状況を表示します"),
        async execute(interaction) {
            // ユーザーネーム取得
            const { user } = interaction;
            let userName;
            if (user.discriminator === "0") {
                userName = `@${user.username}`;
            } else {
                userName = `${user.username}#${user.discriminator}`;
            }

            // DBからデータを取得してオブジェクト生成
            const userData = (await find("main", "user", { userId })).shift();
            const goals = {
                todayGoal: userData.todayGoal,
                thisWeekGoal: userData.thisWeekGoal,
                dailyGoal: userData.dailyGoal,
                weeklyGoal: userData.weeklyGoal,
            };
            const timedData = {
                todayTotal: userData.weeklyData[0 /* 月曜 */],
                weeklyTotal: userData.weeklyTotal,
            };

            console.log(JSON.stringify(userData));
            interaction.reply({ embeds: [makeEmbed(userName, goals, timedData)] });
        },
    },
];
