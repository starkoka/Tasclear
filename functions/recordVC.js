const db = require('./db.js');
const userData = require('./userData.js');

const mSecondsOfOneDay = 86400000;

async function joinVC(newState){
    const user = await userData.getUser(newState.id);
    if(!user.isJoined){
        const date = new Date();
        const data = {
            isJoined: true,
            joinedAt: date,
            lastUpdate: date
        }
        await db.update("main","user",{"userId":newState.id},{$set:data});
    }
}

async function leaveVC(oldState){
    const now = new Date();
    let user  = await userData.getUser(oldState.id);
    if(user.isJoined) {
        user.isJoined = false;

        const secondDay = new Date(user.joinedAt); //参加した日の次の0時を取得
        secondDay.setDate(secondDay.getDate() + 1);
        secondDay.setHours(0, 0, 0);

        if(now < secondDay){ //日付をまたがない場合
            const day = (now.getDay() === 0 ? 6 : now.getDay()-1);
            user.weeklyData[day] += Math.floor((now-user.joinedAt) / 1000);
            user.weeklyTotal += Math.floor((now-user.joinedAt) / 1000);
            user.monthlyTotal += Math.floor((now-user.joinedAt) / 1000);
        }
        else if(now === secondDay){ //万が一ミリ秒単位で真夜中だったら
            user  = await userData.getUser(oldState.id);
            if(now.getDay() === 1){
                user.monthlyData[0][6] += Math.floor((now-user.joinedAt) / 1000);
                user.monthlyData += Math.floor((now-user.joinedAt) / 1000);
            }
            else{
                const day = (now.getDay() === 0 ? 5 : now.getDay()-2);
                user.weeklyData[day] += Math.floor((now-user.joinedAt) / 1000);
                user.weeklyTotal += Math.floor((now-user.joinedAt) / 1000);
                user.monthlyData += Math.floor((now-user.joinedAt) / 1000);
            }
        }
        else{
            const all = now-user.joinedAt;
            const firstDate = secondDay-user.joinedAt;
            const lastDate = (all-firstDate) % mSecondsOfOneDay;
            let fullDay = (all-firstDate-lastDate) / mSecondsOfOneDay;
            const day = (now.getDay() === 0 ? 6 : now.getDay()-1);

            user.weeklyData[day] = Math.floor(lastDate / 1000);
            user.weeklyTotal += Math.floor(lastDate / 1000);
            user.monthlyTotal += Math.floor(lastDate / 1000);
            for(let i=day-1; i >= 0; i--){
                if(fullDay === 0)break;
                user.weeklyData[i] = mSecondsOfOneDay / 1000;
                user.weeklyTotal += mSecondsOfOneDay / 1000;
                user.monthlyTotal += mSecondsOfOneDay / 1000;
                fullDay--;
            }

            if(fullDay === 0){
                const firstDay = (user.joinedAt.getDay() === 0 ? 6 : user.joinedAt.getDay()-1);
                user.weeklyData[firstDay] += Math.floor(firstDate / 1000);
            }
            else{
                let monthlyDataWeek=0,monthlyDataDay=6;
                let flag = false;

                for(; monthlyDataWeek < 3; monthlyDataWeek++){
                    if(fullDay === 0)break;
                    for(monthlyDataDay=6; monthlyDataDay >= 0; monthlyDataDay--){
                        if(fullDay === 0){
                            flag = true;
                            break;
                        }
                        user.monthlyData[monthlyDataWeek][monthlyDataDay] = mSecondsOfOneDay / 1000;
                        user.monthlyTotal += mSecondsOfOneDay / 1000;
                        fullDay--;
                    }
                    if(flag)break;
                }

                if(fullDay === 0){
                    user.monthlyData[monthlyDataWeek][monthlyDataDay] += firstDate / 1000;
                    user.monthlyTotal += firstDate / 1000;
                }
            }
        }

        await db.update("main","user",{"userId":oldState.id},{$set:user});
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