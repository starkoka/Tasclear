const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
const userData = require('./userData.js');

async function joinVC(newState,newChannel){
    await userData.makeUserData(newState.id);
    const date = new Date();
    date.setTime(date.getTime() + 1000*60*60*9); //JST
    const data = {
        isJoined: true,
        joinedAt: date,
        lastUpdate: date
    }
    await db.update("main","user",{"userId":newState.id},{$set:data});
}

async function leaveVC(oldState,oldChannel){

}

exports.vcStateUpdate = async function func(oldState, newState) {
    if(oldState.channel === null){
        const newChannel = await db.find("main","VC",{"channelId":newState.channelId});
        if(newChannel.length > 0){
            await joinVC(newState,newChannel);
        }
    }
    else if(newState.channel === null){
        const oldChannel = await db.find("main","VC",{"channelId":oldState.channelId});
        if(oldChannel.length > 0){
            await leaveVC(oldState,oldChannel);
        }
    }
    else{
        const oldChannel = await db.find("main","VC",{"channelId":oldState.channelId});
        const newChannel = await db.find("main","VC",{"channelId":newState.channelId});
        if(oldChannel.length > 0){
            await leaveVC(oldState,oldChannel);
        }
        if(newChannel.length > 0){
            await joinVC(newState,newChannel);
        }
    }
}