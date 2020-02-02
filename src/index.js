const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('message', msg => {
    if (msg.content.startsWith("!ics")) {
        msg.reply('Smangle time, bitches!');
    }
});

client.login(process.env.BOT_TOKEN);