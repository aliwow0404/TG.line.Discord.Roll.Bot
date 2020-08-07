

"use strict";
if (!process.env.DISCORD_CHANNEL_SECRET) {
	return;
}
const channelSecret = process.env.DISCORD_CHANNEL_SECRET;
const {
	ShardingManager
} = require('discord.js');

var http = require('http');
setInterval(() => {
    http.get('http://[aitobi].herokuapp.com/');
}, 1000*60*15);

const manager = new ShardingManager('./modules/discord_bot.js', {
	token: channelSecret
});
const run = async () => {
	try {
		console.log(manager.totalShards);
		await manager.spawn();
		manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
	} catch (e) {
		console.log(`Failed to spawn shards: ${e} ${Object.entries(e)}`);
	}

};

run();
manager.on('shardCreate', shard => console.log(`Launched Discord shard ${shard.id}`));
