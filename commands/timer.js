/** @format */

const crypto = require("crypto");

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
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
        .setColor(0x00a0ea)
        .setTitle("タイマー")
        .setAuthor(
            /** @type {import(discord.js).EmbedAuthorOptions} */ {
                name: "StudyRoom BOT",
                iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
                url: "https://github.com/starkoka/StudyRoom-BOT",
            },
        )
        .setDescription(`${message}`)
        .setTimestamp();
}

const scheduledJobs = [];

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("timer")
            .setDescription("指定した時間のタイマーをかけます")
            .addIntegerOption((option) => option.setName("時間").setDescription("待機する時間を指定します").setRequired(true))
            .addIntegerOption((option) => option.setName("分").setDescription("待機する分間を指定します").setRequired(true))
            .addIntegerOption((option) => option.setName("秒").setDescription("待機する秒間を指定します").setRequired(true))
            .addRoleOption((option) => option.setName("ロール").setDescription("メンションするロールを指定します")),

        async execute(interaction) {
            // オプション引数受け取り
            const hours = interaction.options.getInteger("時間");
            const minutes = interaction.options.getInteger("分");
            const seconds = interaction.options.getInteger("秒");

            // ジョブ生成
            const jobId = crypto.randomUUID();
            const { guildId } = interaction;
            const { channelId } = interaction;
            const { user } = interaction;
            // prettier-ignore
            /** @type {import(discord.js).TextChannel} */
            const currentChannel = await interaction.client
                .guilds.cache.get(guildId)
                .channels.cache.get(channelId);

            const rawRole = interaction.options.getRole("ロール");
            let role = null;
            if (rawRole) {
                // noinspection JSUnresolvedReference cf. https://discordjs.guide/popular-topics/permissions.html#setting-role-permissions
                if (!interaction.memberPermissions.has(PermissionsBitField.Flags.MentionEveryone) && rawRole.name === "@everyone") {
                    interaction.reply({ content: "権限がないため`@everyone`をメンションできません", ephemeral: true });
                    return;
                }
                role = rawRole;
            }
            const today = new Date();
            const finallyDate = today.modify({ hour: hours, minute: minutes, second: seconds });
            const before1minDate = finallyDate.modify({ minute: -1 });
            const before5minDate = finallyDate.modify({ minute: -5 });
            const reminders = [];

            if (today < finallyDate) {
                reminders.push({ date: finallyDate, embed: makeEmbed("時間です"), address: role || user, silent: false });
                if (today < before1minDate) {
                    reminders.push({
                        date: before1minDate,
                        embed: makeEmbed("設定時刻1分前です"),
                        address: role || user,
                        silent: true,
                    });
                }
                if (today < before5minDate) {
                    reminders.push({
                        date: before5minDate,
                        embed: makeEmbed("設定時刻5分前です"),
                        address: role || user,
                        silent: true,
                    });
                }

                // ジョブ登録
                // eslint-disable-next-line
                for (const reminder of reminders) {
                    if (reminder.date) {
                        scheduledJobs.push({
                            jobId,
                            guildId,
                            channelId,
                            address: reminder.address,
                            date: reminder.date,
                        });
                        // eslint-disable-next-line
                        await schedule.scheduleJob(reminder.date, async () => {
                            const message = {
                                embeds: [reminder.embed],
                            };
                            if (reminder.silent) message.flags = [4096];
                            if (reminder.address === role) {
                                message.content = `${reminder.address}`;
                                await currentChannel.send(message);
                            } else {
                                await user.send(message);
                            }
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
