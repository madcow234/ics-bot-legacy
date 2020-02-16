import { newCountdownEmbed,
         newCountdownHistoryEmbed } from '../templates/embed';
import { sleep }                    from '../utils/timer';
import messageConstants             from '../../resources/message-constants';
import log                          from "winston";

/**
 * Executes a timed countdown.
 *
 * @param message the message that requested the countdown
 * @param historyDescription a description of the events that led to the countdown
 * @returns {Promise<void>} an empty Promise
 */
exports.executeCountdown = async (message, historyDescription) => {
    try {
        let stepNums = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

        // Create the countdown embed that will be edited as it commences
        let countdownEmbed = newCountdownEmbed(messageConstants.IMAGES.ONE);

        // Send the countdown embed to the channel and save it
        let countdownEmbedMessage = await message.channel.send(countdownEmbed);

        let description = "";
        for (const step of stepNums) {
            if (step === "ONE") {
                // Step 1 consists of flashing ALERT twice

                await sleep(1100);
                // We edit the message without changing the embed content so it will flash on the screen
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);

                await sleep(1100);
                // We edit the message without changing the embed content so it will flash on the screen
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);

            } else if (step === "TWO") {
                // Step 2 consists of flashing ICS once

                countdownEmbed.setImage(messageConstants.IMAGES[step]);
                await sleep(1100);
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);

            } else {
                // For the remainder of the steps, we:
                //      append the current countdown step to the countdown embed
                //      set the image for the next "mario kart" style countdown

                description += `\n\n${messageConstants.COUNTDOWN[step]}`;
                countdownEmbed.setDescription(description).setImage(messageConstants.IMAGES[step]);

                await sleep(1100);
                countdownEmbedMessage = await countdownEmbedMessage.edit(countdownEmbed);
            }
        }

        // Wait 5 seconds, then delete the countdown embed message
        await sleep(5100);
        await countdownEmbedMessage.delete();

        // Send the history embed message to the channel
        await sleep(100);
        await message.channel.send(newCountdownHistoryEmbed(historyDescription));

    } catch (err) {
        log.error(`[/templates/countdown.js] ${err}`);
    }
};
