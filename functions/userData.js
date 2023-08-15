const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder, version} = require("discord.js");
const system = require('./logsystem.js');
const db = require('./db.js');
const userData = require('./userData.js');
require('date-utils');
const packageVer = require("../package.json");

const ZERO = [0,0,0,0,0,0,0];

/**
 * userIdから情報を取得し、相対的な日付のデータを修正して返す&更新する関数(未作成の場合データが作成される)
 * @param userId 取得するユーザーID
 * @param userId
 * @returns {Promise<WithId<Document>>}
 */
exports.getUser = async function func(userId){
    const data = await db.find("main","user",{userId:userId});
    if(data.length === 0){
        return await userData.makeUserData(userId);
    }
    const user = data[0];
    const date = new Date();
    const nextMonday = new Date();
    if(user.lastUpdate.getDay() === 0){
        nextMonday.setDate(user.lastUpdate.getDate() + 1);
    }
    else{
        nextMonday.setDate(user.lastUpdate.getDate() - user.lastUpdate.getDay() + 7 + 1);
    }

    if(date.toFormat("YYYYMMDD") !== user.lastUpdate.toFormat("YYYYMMDD")) { //同じ日
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
                    user.monthlyTotal = user.weeklyTotal + user.monthlyData[0].reduce((sum, element) => sum + element, 0) + user.monthlyData[1].reduce((sum, element) => sum + element, 0);
                    user.monthlyData = [user.weeklyData,user.monthlyData[0],user.monthlyData[1]];
                    break;
                case 2:
                    user.monthlyTotal = user.weeklyTotal + user.monthlyData[0].reduce((sum, element) => sum + element, 0);
                    user.monthlyData = [ZERO,user.weeklyData,user.monthlyData[0]];
                    break;
                case 3:
                    user.monthlyTotal = user.weeklyTotal;
                    user.monthlyData = [ZERO,ZERO,user.weeklyData];
                    break;
                default:
                    user.monthlyData = [ZERO,ZERO,ZERO];
                    user.monthlyTotal = 0;
                    break;
            }
            user.weeklyData=[];
            const loop = (date.getDay() === 0 ? 7 : date.getDay());
            for(i = 0; i < loop; i++){
                user.weeklyData.push(0);
            }
            for(i = 0; i < 7-loop; i++){
                user.weeklyData.push(null);
            }
            user.weeklyTotal = 0;
        }
    }

    const hour = Math.floor(Math.max(user.weeklyTotal,user.monthlyData[0].reduce((sum, element) => sum + element, 0))/60/60);
    if(hour >= 48){
        user.rank.color = 0x6DBCD1
        user.rank.name = "Platinum";
    }
    else if(hour >= 42){
        user.rank.color = 0xFFEB99
        user.rank.name = "Gold";
    }
    else if(hour >= 35){
        user.rank.color = 0xF00400
        user.rank.name = "Red";
    }
    else if(hour >= 24){
        user.rank.color = 0xF47A00
        user.rank.name = "Orange"
    }
    else if(hour >= 20){
        user.rank.color = 0xBCBC00
        user.rank.name = "Yellow"
    }
    else if(hour >= 14){
        user.rank.color = 0x0000F4
        user.rank.name = "Blue"
    }
    else if(hour >= 10){
        user.rank.color = 0x00B5F7
        user.rank.name = "Light Blue"
    }
    else if(hour >= 7){
        user.rank.color = 0x007B00
        user.rank.name = "Green"
    }
    else if(hour >= 3){
        user.rank.color = 0x7C3E00
        user.rank.name = "Brown"
    }
    else{
        user.rank.color = 0xD9D9D9
        user.rank.name = "Gray"
    }

    user.lastUpdate = date;
    await db.update("main","user",{"userId":userId},{$set:user});
    delete user._id;
    return user;
}

/**
 * 空のuserDataデータを作成する(既にある場合getUser関数が呼ばれてその結果が返される)
 * @param userId データを作成するユーザーID
 * @returns {Promise<WithId<Document>>}
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
            rank:{name:"Gray",color:0xD9D9D9},
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
            lastUpdate:date,
        }

        await db.insert("main","user",newData);
    }
    return await userData.getUser(userId);
}

exports.generateDataEmbed = async function func(userId,type){
    const user = client.users.cache.get(userId) ?? await client.users.fetch(userId);
    const data = await userData.getUser(userId);
    let title = "今週の";
    if(type === -1){
        let i=0;
        while(data.weeklyData[i]){

        }
    }
    else if(type === -2){

    }
    else{

    }

    return new EmbedBuilder()
        .setColor(user.rank.color)
        .setTitle(`${title}の勉強データ`)
        .setAuthor({
            name: 'StudyRoom BOT',
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/starkoka/StudyRoom-BOT'
        })
        .setDescription('このbotの概要を紹介します')
        .addFields(
            [
                {
                    name: 'バージョン情報',
                    value: `v${packageVer.version}`,
                },
                {
                    name: 'ソースコード',
                    value: 'このBOTは、オープンソースとなっています。[GitHub](https://github.com/starkoka/StudyRoom-BOT)にて公開されています。\n'
                },
                {
                    name: 'バグの報告先',
                    value: "[Issue](https://github.com/starkoka/StudyRoom-BOT/issues)までバグの報告をお願いします。\nサポート等の詳細は`/help`や`/admin-help`を実行してください。\n"
                },
                {
                    name: '実行環境',
                    value: `node.js v${process.versions.node} \ndiscord.js v${version} \n\nDocker v24.0.2\nMongoDB 6.0 Powered by Google Cloud`
                },
            ]
        )
        .setTimestamp()
        .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' })
}