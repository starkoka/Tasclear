const {EmbedBuilder} = require("discord.js");
const db = require('./db.js');
const userData = require('./userData.js');
require('date-utils');

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
    let username;
    if(user.discriminator === "0"){
        username = `@${user.username}`;
    }
    else{
        username = `${user.username}#${user.discriminator}`;
    }

    if(user.bot){
        return new EmbedBuilder()
            .setColor(0xD9D9D9)
            .setTitle(`${username} さんのデータ`)
            .setThumbnail(user.displayAvatarURL())
            .setAuthor({
                name: 'StudyRoom BOT',
                iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                url: 'https://github.com/starkoka/StudyRoom-BOT'
            })
            .setDescription('botのデータを確認することはできません')
            .setTimestamp()
            .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' })
    }

    const data = await userData.getUser(userId);

    const fields = [];
    let title = "今週";
    let total,ave,authorTime="",graph="";
    const now = new Date();
    if(type === -1){
        let i=0;
        now.setDate(now.getDate() - now.getDay());
        while(data.weeklyData[i] !== null && i<7){
            now.setDate(now.getDate() + 1);
            const time = data.weeklyData[i]/60/60;
            fields.push({
                name: now.toFormat("MM/DD"),
                value: `\`\`\`${Math.floor(time*10)/10}時間\`\`\``
            })
            graph += `${now.toFormat("MM/DD")} [${"#".repeat(Math.floor(time/3))}${"-".repeat(8-Math.floor(time/3))}] ${Math.floor(time*10)/10}時間\n`
            i++;
        }
        total = data.weeklyTotal;
        ave = total/i;
    }
    else if(type === -2){
        title = "直近4週間"
        const now2 = new Date();
        const day = now.getDay();
        now.setDate(now.getDate() - now.getDay() + 1);
        now2.setDate(now2.getDate() - now2.getDay() + 7);
        for(let i = -1; i < 4-1 ; i++) {
            let weeklyTotal;
            if(i === -1)weeklyTotal = data.weeklyTotal/60/60;
            else weeklyTotal = data.monthlyData[i].reduce((sum, element) => sum + element, 0)/60/60
            fields.push({
                name: `${now.toFormat("MM/DD")} ~ ${now2.toFormat("MM/DD")}`,
                value: `\`\`\`${Math.floor(weeklyTotal*10)/10}時間\`\`\``
            })
            graph += `${now.toFormat("MM/DD")} ~ ${now2.toFormat("MM/DD")} [${"#".repeat(Math.floor(weeklyTotal/7/3))}${"-".repeat(8-Math.floor(weeklyTotal/7/3))}]\n`
            now.setDate(now.getDate() - 7);
            now2.setDate(now2.getDate() - 7);
        }
        fields.reverse();
        total = data.weeklyTotal;
        ave = total/(7*3 + day + 1);
        authorTime = `週の平均時間：${Math.floor(ave*7/60/60*10)/10}時間\n`;
    }
    else{
        if(type === 0)title = "先週";
        else title = `${type}週間前`;
        now.setDate(now.getDate() - now.getDay() - 7*(type+1));
        for(let i=0; i < 7; i++){
            now.setDate(now.getDate() + 1);
            const time = data.monthlyData[type][i]/60/60;
            fields.push({
                name: now.toFormat("MM/DD"),
                value: `\`\`\`${Math.floor(time*10)/10}時間\`\`\``
            })
            graph += `${now.toFormat("MM/DD")} [${"#".repeat(Math.floor(time/3))}${"-".repeat(8-Math.floor(time/3))}]\n`
        }
        total = data.monthlyData[type].reduce((sum, element) => sum + element, 0);
        ave = total/7;
    }
    /* 実験的機能のため無効化
    fields.push({
        name: "グラフ",
        value: `\`\`\`${graph}\`\`\``
    })
    */

    return new EmbedBuilder()
        .setColor(data.rank.color)
        .setTitle(`${username} さんの${title}のデータ`)
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({
            name: 'StudyRoom BOT',
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/starkoka/StudyRoom-BOT'
        })
        .setDescription(`現在のランク：${data.rank.name}\n${title}の合計時間：${Math.floor(total/60/60*10)/10}時間\n${authorTime}1日の平均時間：${Math.floor(ave/60/60*10)/10}時間`)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' })
}