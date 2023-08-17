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
            await interaction.deferReply({ ephemeral: true });
            // 入力されたoptionの代入
            const goal = interaction.options.getString("対象");
            let time = interaction.options.getInteger("時間");
            if (time === 0) time = null;

            const userID = interaction.user.id;

            if (time >= 0) {
                switch (goal) {
                    case "0": {
                        await db.update(
                            "main",
                            "user",
                            { userId: userID },
                            {
                                $set: {
                                    todayGoal: time,
                                },
                            },
                        );
                        break;
                    }
                    case "1": {
                        await db.update(
                            "main",
                            "user",
                            { userId: userID },
                            {
                                $set: {
                                    thisWeekGoal: time,
                                },
                            },
                        );
                        break;
                    }
                    case "2": {
                        await db.update(
                            "main",
                            "user",
                            { userId: userID },
                            {
                                $set: {
                                    dailyGoal: time,
                                },
                            },
                        );
                        break;
                    }
                    case "3": {
                        await db.update(
                            "main",
                            "user",
                            { userId: userID },
                            {
                                $set: {
                                    weeklyGoal: time,
                                },
                            },
                        );
                        break;
                    }
                    default:
                        break;
                }
                // 登録確認
                await interaction.editReply("目標を設定しました");
            } else if (time < 0) await interaction.editReply("不正な入力です。再度実行して下さい。");
        },
    },
];
