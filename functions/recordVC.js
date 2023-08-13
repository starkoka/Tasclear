const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
const userData = require('./userData.js');

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
    const user  = userData.getUser(oldState.id);
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