const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
require('date-utils');

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

/**
 * userIdから情報を取得し、相対的な日付のデータを修正して返す&更新する関数
 * @param userId 取得するユーザーID
 * @param userId
 * @returns {Promise<WithId<Document>>}
 */
exports.getUser = async function func(userId){
    const user = (await db.find("main","user",{userId:userId}))[0];
    const date = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(user.lastUpdate.getDate() - user.lastUpdate.getDay() + 7 + 1);

    if(date.toFormat("YYYYMMDD") !== user.lastUpdate.toFormat("YYYYMMDD")) {　//同じ日
        if (nextMonday < date) { //同じ週
            for (let i = 0; i < date.getDay() + 1; i++) {
                if (user.weeklyData[i] === null) user.weeklyData[i] = 0;
            }
        }
        else { //異なる週
            let i=2;
            for(; i < 2+3+1; i++){
                nextMonday.setDate(user.lastUpdate.getDate() - user.lastUpdate.getDay() + 7*i + 1);
                if (nextMonday > date)break;
            }

            const weekSum = user.weeklyData.reduce((sum, element) => sum + element, 0);
            switch(i){
                case 2:
                    user.weeklyData = [weekSum,user.weeklyData[0],user.weeklyData[1]];
                    break;
                case 3:
                    user.weeklyData = [0,weekSum,user.weeklyData[0]];
                    break;
                case 4:
                    user.weeklyData = [0,0,weekSum];
                    break;
                default:
                    user.weeklyData = [0,0,0];
                    break;
            }
            user.weeklyData=[0,0,0,0,0,0,0];
        }
        user.lastUpdate = date;
        await db.update("main","user",{"userId":userId},{$set:user});
    }
    delete user._id;
    return user;
}