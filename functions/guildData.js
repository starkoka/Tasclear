const db = require('./db.js');

exports.joinGuild = async function(interaction){
    const guild = client.guilds.cache.get(interaction.guildId) ?? await client.guilds.fetch(interaction.guildId);
}

exports.deleteGuild = async function(interaction){
    await db.delete("main","guild",{guildId:interaction.guildId});
    await db.delete("main","guildUser",{guildId:interaction.guildId});
}

exports.joinMember = async function(interaction){
    await db.insert("main","user",{userId:interaction.user.id,guildId:interaction.guildId});
}

exports.deleteMember = async function(interaction){
    await db.delete("main","guildMember",{userId:interaction.user.id,guildId:interaction.guildId});
}