const { Client, GatewayIntentBits, Collection, Partials} = require('discord.js');
const config = require('./config.json')
const path = require("path");
const fs = require("fs");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel],
});
module.exports.client=client;


/*関数読み込み*/
const db = require("./functions/db.js");
const system = require('./functions/logsystem.js');


/*スラッシュコマンド登録*/
module.exports.client=client;
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;
client.once("ready", async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }

    }
    console.log("ready");
    await system.log("Ready!");
});




/*スラッシュコマンド呼び出し*/
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    await system.log(command.data.name,"SlashCommand");
    try {
        await command.execute(interaction);
    } catch (error) {
        await system.error("スラッシュコマンド実行時エラー : " + command.data.name,error);
        try{
            await interaction.reply({ content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true });
        } catch{
            const reply = await interaction.editReply({ content: 'エラーが発生しました。', ephemeral: true });
            await reply.reactions.removeAll()
        }
    }
});

client.login(config.token);
