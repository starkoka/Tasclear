const db = require('./db.js');
const system = require('./logsystem.js');

exports.joinGuild = async function(guild){
    const newRole = await guild.roles.create({
        name: 'タスク処理中',
        color: 0x3CDE99,
        reason: "たすくりあにより作成"
    });
    await db.insert("main","guild",{guildId:guild.id,roleId:newRole.id,deleteRole:[],newsId:null});

    const guildMember = await guild.members.fetch()
    for(let i=0; i < guild.memberCount;i++){
        if(!guildMember.at(i).user.bot){
            await db.insert("main","guildUser",{
                userId:guildMember.at(i).user.id,
                guildId:guild.id,
                deleteRole:[],
                roleId:newRole.id,
                removedRole:[]
            });
        }
    }
    await system.log(`${guild.name}(ID:${guild.id})に参加しました`,"ギルド参加通知");
}

exports.deleteGuild = async function(guild){
    await db.delete("main","guild",{guildId:guild.id});
    await db.delete("main","guildUser",{guildId:guild.id});
    await system.log(`${guild.name}(ID:${guild.id})から退出しました`,"ギルド退出通知");
}

exports.joinMember = async function(interaction){
    await db.insert("main","guildUser",{userId:interaction.user.id,guildId:interaction.guild.id});
}

exports.removeMember = async function(interaction){
    await db.delete("main","guildUser",{userId:interaction.user.id,guildId:interaction.guild.id});
}