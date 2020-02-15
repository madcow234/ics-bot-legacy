import { CountdownEmbed, CountdownHistoryEmbed } from '../templates/embed';
import { Sleep } from '../utils/timer';
import log from "winston";

exports.executeCountdown = async(client, message, historyDescription) => {
    try {
        const messageConstants = await require("../../resources/message-constants.json");

        let stepNums = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

        let countdownEmbed = CountdownEmbed(client, messageConstants.IMAGES.ONE);

        let countdownEmbedMessage = await message.channel.send(countdownEmbed);

        let description = "";
        for (const step of stepNums) {
            if (step === "ONE") {
                await Sleep(1100);
                await countdownEmbedMessage.edit(countdownEmbed);

                await Sleep(1100);
                await countdownEmbedMessage.edit(countdownEmbed);

            } else if (step === "TWO") {
                countdownEmbed.setImage(messageConstants.IMAGES[step]);

                await Sleep(1100);
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);

            } else {
                description += `\n\n${messageConstants.COUNTDOWN[step]}`;
                countdownEmbed.setDescription(description).setImage(messageConstants.IMAGES[step]);

                await Sleep(1100);
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);
            }
        }

        let historyEmbed = CountdownHistoryEmbed(client, historyDescription);

        await Sleep(5100);
        await countdownEmbedMessage.delete();

        await Sleep(100);
        await message.channel.send(historyEmbed);

    } catch (err) {
        log.error(`[/templates/countdown.js] ${err.message}`);
    }
};
