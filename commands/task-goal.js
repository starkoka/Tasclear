/** @format */

/** @typedef UserData
 *  @property {string} userId DiscordのユーザーID
 *  @property {{name: string, color:number}} rank 現在のランク
 *  @property {number} todayGoal 今週の目標時間[h]
 *  @property {number} thisWeekGoal 今週の目標時間[h]
 *  @property {number} dailyGoal 毎日の目標時間[h]
 *  @property {number} weeklyGoal 毎週の目標時間[h]
 *  @property {number[]} weeklyData[] 今週のデータ(0が月曜)[s]
 *  @property {number} weeklyTotal 今週の合計[s] */

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { find } = require("../functions/db.js");

/** Embedの生成
 * @param {number} color ランクの色
 * @param {string} userName 対象のユーザ名
 * @param {string} avatarURL ユーザのアイコンURL
 * @param {{name: string, value: string}[]} fields フィールドデータ
 * @return {EmbedBuilder} */
function makeEmbed(color, userName, avatarURL, fields) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(`${userName} さんの進捗データ`)
        .setThumbnail(avatarURL)
        .setAuthor(
            /** @type {import(discord.js).EmbedAuthorOptions} */ {
                name: "Tasclear",
                iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
                url: "https://github.com/starkoka/Tasclear",
            },
        )
        .addFields(/** @type any */ fields)
        .setTimestamp()
        .setFooter(/** @type {import(discord.js).EmbedFooterOptions} */ { text: "Developed by 「タスクマネージャーは応答していません」" });
}

module.exports = [
    {
        data: new SlashCommandBuilder().setName("task-goal").setDescription("設定した目標と現在の進捗状況を表示します"),
        async execute(interaction) {
            /* DBからデータを取得してオブジェクト生成 */
            const { user } = interaction;
            const userData = /** @type UserData */ (await find("main", "user", { userId: user.id })).shift();

            /* color取得 */
            const { color } = userData.rank;

            /* ユーザーネーム取得 */
            let userName;
            if (user.discriminator === "0") {
                userName = `@${user.username}`;
            } else {
                userName = `${user.username}#${user.discriminator}`;
            }

            /* ユーザアイコン取得 */
            const avatarURL = user.displayAvatarURL();

            /* fields生成 */
            const goals = {
                todayGoal: userData.todayGoal * 3600,
                thisWeekGoal: userData.thisWeekGoal * 3600,
                dailyGoal: userData.dailyGoal * 3600,
                weeklyGoal: userData.weeklyGoal * 3600,
            };
            const timedData = {
                todayTotal: userData.weeklyData[4 /* 月曜 */],
                weeklyTotal: userData.weeklyTotal,
            };
            const fields = [];
            fields.push({
                name: "today",
                value: `${timedData.todayTotal}/${goals.todayGoal}`,
            });

            console.log(JSON.stringify(userData));
            interaction.reply({ embeds: [makeEmbed(color, userName, avatarURL, fields)] });
        },
    },
];
