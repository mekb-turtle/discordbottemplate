console.log("Loading...");

require('dotenv').config();
const Discord = require("discord.js");
const client = new Discord.Client();

const escape = (text) => {
	return Discord.Util.escapeMarkdown(text).replace(/\@/g,"@\u200b").replace(/\r\n/gm,"\n").replace(/\r/gm,"\n");
}

var loading = true;

const prefix = "!";
const token = process.env.TOKEN;

process.on("SIGUSR1", process.exit);
process.on("SIGUSR2", process.exit);
process.on("SIGINT", process.exit);
process.on("exit", process.exit);
process.on("uncaughtException", err=>{console.error(err);process.exit();});

if (token) {

client.on("ready", async () => {
	console.log("Ready!");
	await client.user.setActivity(`${prefix}help`,{type:"PLAYING"});
	loading = false;
});

client.login(token);

const devs = ["your_discord_id_here"];

const getId = (id) => {
	if (id==null||id==undefined) return null;
	id=id.author||id;
	id=id.user  ||id;
	id=id.guild ||id;
	id=id.id    ||id;
	return id;
}

const isADev = (id) => {
	return devs.includes(getId(id));
}

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const denyMessage = async (message) => {
	await message.react("\u274e");
}

const timeMessage = async (message) => {
	await message.react("\u23f2"); 
}

const maintenance = false;
var cooldowns = [];
var cooldowns2 = [];

const checkCantUse = async (message,ignoreMaintenance) => {
	if (isADev(message)) return false;
	if (cooldowns.indexOf(message.author.id)>-1) {
		if (cooldowns2.indexOf(message.author.id)==-1) {
			cooldowns2.push(message.author.id);
			await timeMessage(message);
		}
		return true;
	}
	if (!ignoreMaintenance&&maintenance) {
		await denyMessage(message);
		await message.channel.send("Bot is currently in maintenance, check back later");
		return true;
	}
	cooldowns.push(message.author.id);
	setTimeout(() => {
		var i = cooldowns.indexOf(message.author.id);
		if (i>-1) cooldowns.splice(i,1);
		var j = cooldowns2.indexOf(message.author.id);
		if (j>-1) cooldowns2.splice(j,1);
	}, 3000);
	return false;
}

const headerText = "<:hammer:827800676138221639> bonkbot";

const generateInvite = (permissions,guild) => {
	return `https://discord.com/api/oauth2/authorize?scope=bot&client_id=${client.user.id}&permissions=${permissions}`+(guild?(`&guild_id=${getId(guild)}`):``);
}

client.on("message", async message => {
	if (loading)
		return;
	if (!message.content)
		return;
	if (!message.author)
		return;
	if (message.author.bot)
		return;
	if (message.guild)
		if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES"))
			return;
	var cmd = message.content.trim();
	cmd = cmd.replace(/[\s\n\r\t]/," ").replace("  +"," ");
	var args = cmd.split(" ");
	if (!cmd.startsWith(prefix))
		return;
	cmd = args.shift().toLowerCase();
	cmd = cmd.substring(prefix.length);
	var argsString = args.join(" ");
	
	if (cmd=="ping") {
		if (await checkCantUse(message)) return;
		await message.channel.send("pong");
	}
	
	if (cmd=="help") {
		if (await checkCantUse(message)) return;
		await message.channel.send("bot template\ncommands:\n!ping\n!help\n!invite"
			.replace(/\!/g,prefix));
	}
	
	if (cmd=="invite") {
		if (await checkCantUse(message)) return;
		await message.channel.send(headerText+
		`\nNormal Invite: <${generateInvite(322624)}>`+
		`\nAdmin Invite: <${generateInvite(8)}>`);
	}
});

} else {
	console.error("No token provided");
}
