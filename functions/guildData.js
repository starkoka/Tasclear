const db = require('./db.js');

exports.joinGuild = async function(interaction){
    const guild = client.guilds.cache.get(interaction.id) ?? await client.guilds.fetch(interaction.id);
    await db.insert("main","guild",{guildId:interaction.id,studyRole:null,deleteRole:[]});

    const guildMember = await guild.members.fetch()
    for(let i=0; i < guild.memberCount;i++){
        if(!guildMember.at(i).user.bot) await db.insert("main","guildUser",{userId:guildMember.at(i).user.id,guildId:interaction.id});
    }
}

exports.deleteGuild = async function(interaction){
    await db.delete("main","guild",{guildId:interaction.id});
    await db.delete("main","guildUser",{guildId:interaction.id});
}

exports.joinMember = async function(interaction){
    await db.insert("main","guildUser",{userId:interaction.user.id,guildId:interaction.guild.id});
}

exports.removeMember = async function(interaction){
    await db.delete("main","guildUser",{userId:interaction.user.id,guildId:interaction.guild.id});
}