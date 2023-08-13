const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');

/***
 * 空のuserDataデータを作成する(既にある場合は実行されない)
 * @param userId データを作成するユーザーID
 * @returns {Promise<void>}
 */
exports.makeUserData = async function func(userId){
    const data = await db.find("main","user",{"userId":userId});
    if(data.length === 0){
        const date = new Date();

        const weeklyData=[];
        for(let i = 0; i < date.getDay()+1; i++){
            weeklyData.push(0);
        }
        for(let i = 0; i < 7-(date.getDay()+1); i++){
            weeklyData.push(null);
        }

        const newData = {
            userId:userId,
            isJoined:false,
            joinedAt:null,
            weeklyGoal:null,
            dailyGoal:null,
            thisWeekGoal:null,
            todayGoal:null,
            weeklyData:weeklyData,
            monthlyData:[0,0,0],
            lastUpdate:date
        }

        await db.insert("main","user",newData);
    }
}