const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require("../config.json");
const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });

exports.addChannel = async function run(guildID,channelID) {
    try {
        const database = dbClient.db("main");
        const channel = database.collection("channel");
        const doc = {
            guildID: guildID,
            channelID: channelID
        }
        const result = await channel.insertOne(doc);
        console.log(`Added channel with the id : ${result.insertedId}`);
    } finally {
        await dbClient.close();
    }
}
