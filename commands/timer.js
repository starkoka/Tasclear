/** @format */

const crypto = require("crypto");

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const schedule = require("node-schedule");

/**
 * Dateオブジェクトに対して年月日時分秒それぞれ任意に加算減算した結果を返す
 * @see https://qiita.com/akebi_mh/items/353bf0a6c467835b2b6b */
/* eslint-disable */
Date.prototype.modify = function (obj) {
    // noinspection JSCheckFunctionSignatures
    if (isNaN(this) || typeof obj !== "object") return this;
    const d = new Date(this);
    const b = {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
    };
    for (let p in obj) {
        const n = parseInt(obj[p], 10);
        if (isNaN(n)) return new Date("");
        if (b[p] !== undefined) b[p] += n;
        else return new Date("");
    }
    d.setFullYear(b.year, b.month, b.day);
    d.setHours(b.hour, b.minute, b.second);
    return d;
};

/* eslint-enable */

/** Embedの生成
 * @param {string} message メッセージの内容
 * @return {EmbedBuilder} */
function makeEmbed(message) {
    return new EmbedBuilder()
        .setTitle("timer")
        .setAuthor(/** @type {import(discord.js).EmbedAuthorOptions} */ { name: "StudyRoom-BOT" })
        .setDescription(`${message}`);
}

const scheduledJobs = [];

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("timer")
            .setDescription("指定した時間のタイマーをかけます")
            .addIntegerOption((option) => option.setName("時間").setDescription("待機する時間を指定します").setRequired(true))
            .addIntegerOption((option) => option.setName("分").setDescription("待機する分間を指定します").setRequired(true))
            .addIntegerOption((option) => option.setName("秒").setDescription("待機する秒間を指定します").setRequired(true)),

        async execute(interaction) {
            // オプション引数受け取り
            const hours = interaction.options.getInteger("時間");
            const minutes = interaction.options.getInteger("分");
            const seconds = interaction.options.getInteger("秒");

            // ジョブ生成
            const jobId = crypto.randomUUID();
            const guild = interaction.guildId;
            const channel = interaction.channelId;
            // prettier-ignore
            /** @type {import(discord.js).TextChannel} */
            const currentChannel = await interaction.client
                .guilds.cache.get(guild)
                .channels.cache.get(channel);
            const today = new Date();
            const finallyDate = today.modify({ hour: hours, minute: minutes, second: seconds });
            const before1minDate = finallyDate.modify({ minute: -1 });
            const before5minDate = finallyDate.modify({ minute: -5 });
            const reminders = [];

            if (today < finallyDate) {
                reminders.push({ date: finallyDate, embeds: makeEmbed("it's time!") });
                if (today < before1minDate) {
                    reminders.push({ date: before1minDate, embeds: makeEmbed("it's time! - 1") });
                }
                if (today < before5minDate) {
                    reminders.push({ date: before5minDate, embeds: makeEmbed("it's time! - 5") });
                }

                // ジョブ登録
                // eslint-disable-next-line
                for (const reminder of reminders) {
                    if (reminder.date) {
                        console.log("run");
                        scheduledJobs.push({
                            jobId,
                            guild,
                            channel,
                            date: reminder.date,
                        });
                        // eslint-disable-next-line
                        await schedule.scheduleJob(reminder.date, async () => {
                            await currentChannel.send({ embeds: [reminder.message] });
                            const jobIndex = scheduledJobs.findIndex((job) => job.jobId === jobId);
                            scheduledJobs.splice(jobIndex, 1);
                        });
                    }
                }

                // 登録確認
                await interaction.reply({ content: "タイマーをセットしました", ephemeral: true });
            } else {
                // エラー処理
                await interaction.reply({
                    content: "時間を設定できませんでした．入力した値にミスがないか確認してください．(過去を設定した等)",
                    ephemeral: true,
                });
            }
        },
    },
];
