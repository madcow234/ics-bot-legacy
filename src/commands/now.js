import log from 'winston';
import { RichEmbed } from 'discord.js';

exports.run = async(client, message, args) => {
    try {
        const messageConstants = require("../../resources/message-constants.json");

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        let historyDescription;
        let messagesToDelete = [];

        historyDescription = `An instant countdown successfully completed.`;

        let countdownEmbed = new RichEmbed()
            .setTitle(`Countdown Initiated`)
            .setTimestamp()
            .setDescription(messageConstants.ALERT.ICS)
            .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

        let countdownEmbedMessage = await message.channel.send(countdownEmbed).catch(err => log.error(err));

        let countdown = messageConstants.COUNTDOWN;
        let description = messageConstants.ALERT.ICS;
        for (let line in countdown) {
            description += `\n\n${countdown[line]}`;
            countdownEmbed = new RichEmbed()
                .setTitle(`Countdown Initiated`)
                .setTimestamp()
                .setDescription(description)
                .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

            await delay(1100);
            countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed).catch(err => log.error(err));
        }

        let historyEmbed = new RichEmbed()
            .setTitle(`ICS History Report`)
            .setTimestamp()
            .setDescription(historyDescription)
            .setThumbnail('https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif')
            .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

        await delay(5100);
        messagesToDelete.push(countdownEmbedMessage);
        messagesToDelete.length < 2 ? messagesToDelete[0].delete() : message.channel.bulkDelete(messagesToDelete).catch(err => log.error(err));
        message.channel.send(historyEmbed).catch(err => log.error(err));


    } catch (err) {
        log.error(`[/commands/now.js] ${err.message}`);
    }
};