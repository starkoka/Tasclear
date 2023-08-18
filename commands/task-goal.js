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
                name: "たすくりあ",
                iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
                url: "https://github.com/starkoka/Tasclear",
            },
        )
        .addFields(/** @type any */ fields)
        .setTimestamp()
        .setFooter(/** @type {import(discord.js).EmbedFooterOptions} */ { text: "Developed by 「タスクマネージャーは応答していません」" });
}

/** プログレスバーの生成
 * @param {number} totalTime 計測時間[s]
 * @param {number} goal 目標時間[s]
 * @return {string} */
function makeProgressBar(totalTime, goal) {
    let progressBar = "[";
    if (totalTime <= goal) {
        const progress = 20 - ((goal - totalTime) / goal) * 20;
        for (let i = 0; i < Math.floor(progress); i++) {
            progressBar += `#`;
        }
        progressBar += `#`;
        for (let i = 0; i < 20 - Math.floor(progress); i++) {
            progressBar += `-`;
        }
        progressBar += `] ${Math.floor((progress / 2) * 100) / 10}% DONE`;
    } else {
        progressBar += "####################] 100% DONE";
    }
    return progressBar;
}

/** Fieldの生成
 * @param {string} scope 目標の対象
 * @param {number} totalTime 計測時間[s]
 * @param {number} goal 目標時間[s]
 * @return {{name: string, value: string}} */
function makeField(scope, totalTime, goal) {
    const hour = Math.floor(totalTime / 3600);
    const min = Math.floor((totalTime % 3600) / 60);
    const sec = totalTime % 60;
    let convertedTime = `${sec}秒`;
    if (hour !== 0) {
        convertedTime = `${hour}時間${min}分${convertedTime}`;
    } else if (min !== 0) {
        convertedTime = `${min}分${convertedTime}`;
    }
    const details = `計測時間: \`\`${convertedTime}\`\`\n目標時間: \`\`${goal / 3600}時間\`\``;
    const progressBar = `\`\`\`${goal == null ? "目標が設定されていないため表示できません" : makeProgressBar(totalTime, goal)}\`\`\``;
    return {
        name: scope,
        value: `${details}\n${progressBar}`,
    };
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
            const dbDay = [6, 0, 1, 2, 3, 4, 5];
            const jsDay = new Date().getDay();
            const currentDay = dbDay[jsDay];
            const goals = {
                todayGoal: userData.todayGoal * 3600,
                thisWeekGoal: userData.thisWeekGoal * 3600,
                dailyGoal: userData.dailyGoal * 3600,
                weeklyGoal: userData.weeklyGoal * 3600,
            };
            const timedData = {
                todayTotal: userData.weeklyData[currentDay],
                weeklyTotal: userData.weeklyTotal,
            };
            const fields = [];
            fields.push(makeField("今日", timedData.todayTotal, goals.todayGoal));
            fields.push(makeField("今週", timedData.weeklyTotal, goals.thisWeekGoal));
            fields.push(makeField("毎日", timedData.todayTotal, goals.dailyGoal));
            fields.push(makeField("毎週", timedData.weeklyTotal, goals.weeklyGoal));

            interaction.reply({ embeds: [makeEmbed(color, userName, avatarURL, fields)] });
        },
    },
];
