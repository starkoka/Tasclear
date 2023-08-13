const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
const userData = require('./userData.js');

const secondsOfOneDay = 86400;

async function joinVC(newState){
    await userData.makeUserData(newState.id);
    const date = new Date();
    const data = {
        isJoined: true,
        joinedAt: date,
        lastUpdate: date
    }
    await db.update("main","user",{"userId":newState.id},{$set:data});
}

async function leaveVC(oldState){
    const now = new Date();
    let user  = await userData.getUser(oldState.id);
    user.isJoined = false;

    const secondDay = new Date(user.joinedAt); //参加した日の次の0時を取得
    secondDay.setDate(secondDay.getDate() + 1);
    secondDay.setHours(0, 0, 0);

    if(now < secondDay){ //日付をまたがない場合
        const day = (now.getDay() === 0 ? 6 : now.getDay()-1);
        user.weeklyData[day] += (now-user.joinedAt) / 1000;
    }
    else if(now === secondDay){ //万が一ミリ秒単位で真夜中だったら
        user  = await userData.getUser(oldState.id);
        if(now.getDay() === 1){
            user.monthlyData[0][6] += (now-user.joinedAt) / 1000;
        }
        else{
            const day = (now.getDay() === 0 ? 5 : now.getDay()-2);
            user.weeklyData[day] += (now-user.joinedAt) / 1000;
        }
    }
    else{

    }
}

exports.vcStateUpdate = async function func(oldState, newState) {
    if(oldState.channel === null){
        const newChannel = await db.find("main","VC",{"channelId":newState.channelId});
        if(newChannel.length > 0){
            await joinVC(newState);
        }
    }
    else if(newState.channel === null){
        const oldChannel = await db.find("main","VC",{"channelId":oldState.channelId});
        if(oldChannel.length > 0){
            await leaveVC(oldState);
        }
    }
    else{
        const oldChannel = await db.find("main","VC",{"channelId":oldState.channelId});
        const newChannel = await db.find("main","VC",{"channelId":newState.channelId});
        if(oldChannel.length > 0){
            await leaveVC(oldState);
        }
        if(newChannel.length > 0){
            await joinVC(newState);
        }
    }
}