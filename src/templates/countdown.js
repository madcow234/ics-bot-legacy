import { RichEmbed } from "discord.js";
import log from "winston";

exports.executeCountdown = async(client, message, historyDescription) => {
    const messageConstants = await require("../../resources/message-constants.json");

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    let messagesToDelete = [];

    let stepNums = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

    let countdownEmbed = new RichEmbed()
        .setImage(messageConstants.IMAGES.ONE)
        .setTimestamp()
        .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

    let countdownEmbedMessage = await message.channel.send(countdownEmbed).catch(err => log.error(err));

    let description = ``;
    for (const step of stepNums) {
        if (step === "ONE") {
           await delay(1100);
           await countdownEmbedMessage.edit(countdownEmbed).catch(err => log.error(err));

           await delay(1100);
           await countdownEmbedMessage.edit(countdownEmbed).catch(err => log.error(err));

        } else if (step === "TWO") {
           countdownEmbed
               .setImage(messageConstants.IMAGES[step])
               .setTimestamp()
               .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

           await delay(1100);
           countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed).catch(err => log.error(err));

        } else {
            description += `\n\n${messageConstants.COUNTDOWN[step]}`;
            countdownEmbed
                .setDescription(description)
                .setImage(messageConstants.IMAGES[step])
                .setTimestamp()
                .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');

            await delay(1100);
            countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed).catch(err => log.error(err));
        }

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

};
