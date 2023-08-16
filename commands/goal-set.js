/** @format */

const { SlashCommandBuilder } = require("discord.js");

const db = require("../functions/db.js");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("goal-set")
            .setDescription("目標を設定します")
            .addStringOption((option) =>
                option
                    .setName("対象")
                    .setDescription("目標にする対象を選択します")
                    .setRequired(true)
                    .setChoices(
                        { name: "今日", value: "0" },
                        { name: "今週", value: "1" },
                        { name: "毎日", value: "2" },
                        { name: "毎週", value: "3" },
                    ),
            )
            .addIntegerOption((option) => option.setName("時間").setDescription("時間を設定します").setRequired(true)),

        async execute(interaction) {
            // 入力されたoptionの代入
            const goal = interaction.options.getString("対象");

            const userID = interaction.user.id;

            switch (goal) {
                case "0": {
                    let goalToday = interaction.options.getInteger("時間");
                    if (goalToday === 0) {
                        goalToday = null;
                    }
                    await db.update(
                        "main",
                        "user",
                        { userId: userID },
                        {
                            $set: {
                                todayGoal: goalToday,
                            },
                        },
                    );
                    break;
                }
                case "1": {
                    let goalThisWeek = interaction.options.getInteger("時間");
                    if (goalThisWeek === 0) {
                        goalThisWeek = null;
                    }
                    await db.update(
                        "main",
                        "user",
                        { userId: userID },
                        {
                            $set: {
                                thisWeekGoal: goalThisWeek,
                            },
                        },
                    );
                    break;
                }
                case "2": {
                    let goalEveryDay = interaction.options.getInteger("時間");
                    if (goalEveryDay === 0) {
                        goalEveryDay = null;
                    }
                    await db.update(
                        "main",
                        "user",
                        { userId: userID },
                        {
                            $set: {
                                dailyGoal: goalEveryDay,
                            },
                        },
                    );
                    break;
                }
                case "3": {
                    let goalEveryWeek = interaction.options.getInteger("時間");
                    if (goalEveryWeek === 0) {
                        goalEveryWeek = null;
                    }
                    await db.update(
                        "main",
                        "user",
                        { userId: userID },
                        {
                            $set: {
                                weeklyGoal: goalEveryWeek,
                            },
                        },
                    );
                    break;
                }
                default:
                    break;
            }

            // 登録確認
            await interaction.reply({ content: "目標を設定しました", ephemeral: true });
        },
    },
];
