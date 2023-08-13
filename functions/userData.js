const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');


exports.makeNewData = async function func(userId){
    const data = await db.find("main","user",{"userID":userId});
    if(data.length === 0){
        const date = new Date;
        const weeklyData=[];
        for(let i = 0; i < date.getDay()+1; i++){
            weeklyData.push(0);
        }
        for(let i = 0; i < 7-date.getDay(); i++){
            weeklyData.push(null);
        }

        const newData = {
            userID:userId,
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