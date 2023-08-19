const {EmbedBuilder} = require("discord.js");
const {PythonShell} = require('python-shell');
const fs = require("fs");
const {createCanvas,loadImage,registerFont} = require("canvas");

const db = require('./db.js');
const userData = require('./userData.js');
const system = require('./logsystem.js');
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

exports.generateDataEmbed = async function func(user,type){
    let username;
    if(user.discriminator === "0"){
        username = `@${user.username}`;
    }
    else{
        username = `${user.username}#${user.discriminator}`;
    }

    const data = await userData.getUser(user.id);
    const fields = [];
    let title = "今週";
    let total,ave,authorTime="";
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
        }
        total = data.monthlyData[type].reduce((sum, element) => sum + element, 0);
        ave = total/7;
    }

    return new EmbedBuilder()
        .setColor(data.rank.color)
        .setTitle(`${username} さんの${title}のデータ`)
        .setThumbnail(user.displayAvatarURL())
        .setAuthor({
            name: 'たすくりあ',
            iconURL: 'https://cdn.discordapp.com/avatars/1084327261785833474/5a3be1413c9a8211fd3b35e1592f4c01.webp',
            url: 'https://github.com/starkoka/Tasclear/'
        })
        .setDescription(`現在のランク：${data.rank.name}\n${title}の合計時間：${Math.floor(total/60/60*10)/10}時間\n${authorTime}1日の平均時間：${Math.floor(ave/60/60*10)/10}時間`)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Developed by 「タスクマネージャーは応答していません」' })
}

async function sendImage(datum,labels,user,type,data,interaction,username,weeklyTotal){
    try{
        const genChart = new PythonShell('./functions/genChart.py');
        genChart.send(`${datum}\n${labels}\n${user.id}${type}\n${data.rank.color}`);
        await genChart.on('message', async function (name) {
            registerFont('./font/NotoSansCJK-Regular.ttc', {family: 'NotoSansCJK-Regular'});
            const canvas = createCanvas(3000, 1500);
            const ctx = canvas.getContext('2d');
            fs.copyFileSync(`./img/data/${data.rank.name}.png`, `./img/temp/${name}.png`);

            const image = await loadImage(`./img/temp/${name}.png`);
            const iconURL = user.displayAvatarURL().slice( 0, -5 );
            const icon = await loadImage(iconURL);
            const chart = await loadImage(`./img/temp/${name}-chart.png`);
            ctx.drawImage(image, 0, 0, 3000, 1500);
            ctx.drawImage(icon, 720-512/2, 375-512/2, 512,512);
            ctx.drawImage(chart, 2000-640*3.0/2, 725-480*3.0/2,640*3.0,480*3.0);

            ctx.font = '75px "NotoSansCJK-Regular"';
            ctx.fillStyle = '#666666';
            ctx.textAlign = "center";
            ctx.fillText(username, 720, 800);

            ctx.font = '50px "NotoSansCJK-Regular"';
            ctx.fillText(String(Math.floor(data.monthlyTotal/60/60*10)/10), 850, 1315);
            if(weeklyTotal!=="---"){
                weeklyTotal = String(Math.floor(weeklyTotal/60/60*10)/10)
            }
            ctx.fillText(weeklyTotal, 850, 1175);

            const buffer = canvas.toBuffer();
            fs.writeFileSync(`./img/temp/${name}.png`, buffer);
            await interaction.editReply({
                embed : {
                    image : {
                        url : "attachment://userdata.png"
                    }
                },
                files : [{ attachment :`./img/temp/${name}.png`, name : "userdata.png"}]
            });
            try{
                fs.unlinkSync(`./img/temp/${name}.png`);
                fs.unlinkSync(`./img/temp/${name}-chart.png`);
            }
            catch(err){
                await system.error("画像キャッシュの削除に失敗しました",err,"キャッシュ削除失敗");
            }
        });
    }
    catch{
        await interaction.editReply("画像の生成・送信時に失敗しました。短時間で同じコマンドを実行するとエラーが発生するおそれがあります。\n時間を開けてもう一度お試しください。");
    }
}

exports.generateDataImage = async function func(user,type,interaction){
    let username;
    if(user.discriminator === "0"){
        username = `@${user.username}`;
    }
    else{
        username = `${user.username}#${user.discriminator}`;
    }

    const data = await userData.getUser(user.id);
    let datum = "",labels = "";
    let total;
    const now = new Date();
    if(type === -1){
        now.setDate(now.getDate() - now.getDay() + 8);
        for(let i=6; i >= 0; i--){
            if(i !== 6){
                datum += " ";
                labels += " ";
            }
            now.setDate(now.getDate() - 1);
            labels += (now.toFormat("MM/DD"));
            if(data.weeklyData[i] === null){
                datum　+= "0";
            }
            else{
                datum　+= String(Math.floor(data.weeklyData[i]/60/60*10)/10);
            }
        }

        await sendImage(datum,labels,user,type,data,interaction,username,data.weeklyTotal);
    }
    else if(type === -2){
        const now2 = new Date();
        now.setDate(now.getDate() - now.getDay() + 1);
        now2.setDate(now2.getDate() - now2.getDay() + 7);
        for(let i = -1; i < 4-1 ; i++) {
            let weeklyTotal;
            if(i === -1)weeklyTotal = data.weeklyTotal/60/60;
            else weeklyTotal = data.monthlyData[i].reduce((sum, element) => sum + element, 0)/60/60
            if(i !== -1){
                datum += " ";
                labels += " ";
            }
            datum += `${Math.floor(weeklyTotal*10)/10}`
            labels += `${now.toFormat("MM/DD")}~${now2.toFormat("MM/DD")}`

            now.setDate(now.getDate() - 7);
            now2.setDate(now2.getDate() - 7);
        }
        total = data.weeklyTotal;
        await sendImage(datum,labels,user,type,data,interaction,username,"---");
    }
    else{
        now.setDate(now.getDate() - now.getDay() - 7*(type)-1);
        for(let i=6; i >= 0; i--){
            now.setDate(now.getDate() - 1);
            if(i !== 6){
                datum += " ";
                labels += " ";
            }
            datum += String(Math.floor(data.monthlyData[type][i]/60/60*10)/10);
            labels += (now.toFormat("MM/DD"));
        }
        total = data.monthlyData[type].reduce((sum, element) => sum + element, 0);
        await sendImage(datum,labels,user,type,data,interaction,username,total);
    }
}