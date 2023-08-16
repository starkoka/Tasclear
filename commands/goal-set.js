/** @format */

const { SlashCommandBuilder } = require("discord.js");

const db = require("../functions/db.js");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("goal-set")
            .setDescription("目標の時間を設定します")
            .addStringOption((option) =>
                option
                    .setName("select-goal")
                    .setDescription("目標時間を設定するオプションを選択します")
                    .setRequired(true)
                    .setChoices(
                        { name: "今日", value: "0" },
                        { name: "今週", value: "1" },
                        { name: "毎日", value: "2" },
                        { name: "毎週", value: "3" },
                    ),
            ),

        /* 一応おいて置くの細道
            .addIntegerOption(option => option.setName("今日").setDescription("今日の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("今週").setDescription("今週の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("毎日").setDescription("毎日の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("毎週").setDescription("毎週の目標時間を設定します").setRequired(false)),
            */

        async execute(interaction) {
            // 入力されたoptionの代入
            const goal = interaction.option.getInteger("select-goal");

            const userID = interaction.user.id;

            switch (goal) {
                case "0": {
                    const goalToday = interaction.option.getInteger("今日");
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
                    const goalThisWeek = interaction.option.getInteger("今週");
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
                    const goalEveryDay = interaction.option.getInteger("毎日");
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
                    const goalEveryWeek = interaction.option.getInteger("毎週");
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
        },
    },
];
