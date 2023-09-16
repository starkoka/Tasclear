const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
const userData = require('./userData.js');
require('date-utils');

const ZERO = [0,0,0,0,0,0,0];

/**
 * userIdから情報を取得し、相対的な日付のデータを修正して返す&更新する関数
 * @param userId 取得するユーザーID
 * @param userId
 * @returns {Promise<WithId<Document>>}
 */
exports.getUser = async function func(userId){
    const data = await db.find("main","user",{userId:userId});
    if(data.length === 0){
        await userData.makeUserData(userId);
    }
    else{
        const user = data[0];
        const date = new Date();
        const nextMonday = new Date();
        if(user.lastUpdate.getDay() === 0){
            nextMonday.setDate(user.lastUpdate.getDate() + 1);
        }
        else{
            nextMonday.setDate(user.lastUpdate.getDate() - user.lastUpdate.getDay() + 7 + 1);
        }

        if(date.toFormat("YYYYMMDD") !== user.lastUpdate.toFormat("YYYYMMDD")) {　//同じ日
            user.dailyGoal = null;
            if (nextMonday > date) { //同じ週
                for (let i = 0; i < (date.getDay()===0 ? 7 : date.getDay()) ; i++) {
                    if (user.weeklyData[i] === null) user.weeklyData[i] = 0;
                }
            }
            else { //異なる週
                user.weeklyGoal = null;
                let i=1;
                for(; i < 1+4; i++){
                    nextMonday.setDate(nextMonday.getDate() + 7);
                    if (nextMonday > date)break;
                }

                switch(i){
                    case 1:
                        user.monthlyData = [user.weeklyData,user.monthlyData[0],user.monthlyData[1]];
                        user.monthlyTotal = user.weeklyTotal +　user.monthlyData[0].reduce((sum, element) => sum + element, 0) + user.monthlyData[1].reduce((sum, element) => sum + element, 0);
                        break;
                    case 2:
                        user.monthlyData = [ZERO,user.weeklyData,user.monthlyData[0]];
                        user.monthlyTotal = user.weeklyTotal +　user.monthlyData[0].reduce((sum, element) => sum + element, 0)
                        break;
                    case 3:
                        user.monthlyData = [ZERO,ZERO,user.weeklyData];
                        user.monthlyTotal = user.weeklyTotal;
                        break;
                    default:
                        user.monthlyData = [ZERO,ZERO,ZERO];
                        user.monthlyTotal = 0;
                        break;
                }
                user.weeklyData=[];
                const loop = (date.getDay() === 0 ? 7 : date.getDay());
                for(let i = 0; i < loop; i++){
                    user.weeklyData.push(0);
                }
                for(let i = 0; i < 7-loop; i++){
                    user.weeklyData.push(null);
                }
                user.weeklyTotal = 0;
            }
            user.lastUpdate = date;
            await db.update("main","user",{"userId":userId},{$set:user});
        }
        delete user._id;
        return user;
    }
}

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
        const loop = (date.getDay() === 0 ? 7 : date.getDay());
        for(let i = 0; i < loop; i++){
            weeklyData.push(0);
        }
        for(let i = 0; i < 7-loop; i++){
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
            weeklyTotal:0,
            monthlyData:[ZERO,ZERO,ZERO],
            monthlyTotal:0,
            lastUpdate:date
        }

        await db.insert("main","user",newData);
    }
    else{
        await userData.getUser(userId);
    }
}