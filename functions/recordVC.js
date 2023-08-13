const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');

async function joinVC(newState,newChannel){
    const date = new Date(newState);
}

async function leaveVC(oldState,oldChannel){

}

exports.vcStateUpdate = async function func(oldState, newState) {
    if(oldState.channel === null){
        const oldChannel = await db.find("main","VC",{"channelId":oldState.channelId});
        if(oldChannel.length > 0){
            await leaveVC(oldState,oldChannel);
        }
    }
    else if(newState.channel === null){
        const newChannel = await db.find("main","VC",{"channelId":newState.channelId});
        if(newChannel.length > 0){
            await joinVC(newState,newChannel);
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