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

        /* 一応おいて置くの細道
            .addIntegerOption(option => option.setName("今日").setDescription("今日の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("今週").setDescription("今週の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("毎日").setDescription("毎日の目標時間を設定します").setRequired(false))
            .addIntegerOption(option => option.setName("毎週").setDescription("毎週の目標時間を設定します").setRequired(false)),
            */

        async execute(interaction) {
            // 入力されたoptionの代入
            const goal = interaction.options.getString("対象");

            const userID = interaction.user.id;
            console.log(goal);

            switch (goal) {
                case "0": {
                    const goalToday = interaction.options.getInteger("時間");
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
                    const goalThisWeek = interaction.options.getInteger("時間");
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
                    const goalEveryDay = interaction.options.getInteger("時間");
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
                    const goalEveryWeek = interaction.options.getInteger("時間");
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
