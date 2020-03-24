import { newErrorEmbed,
         newCountdownHistoryEmbed,
         newDelayedCountdownTimerEmbed,
         newDelayedCountdownLobbyEmbed } from '../templates/embed';
import { buildMentionsArray }            from '../utils/mentionsService';
import { executeCountdown }              from '../templates/countdown';
import { config }                        from '../conf/config';
import { sleep }                         from '../utils/timer';
import log                               from 'winston';

/**
 * Executes a countdown after a desired delay.
 *
 * @param message the message requesting the instant countdown
 * @param args a list of any arguments passed with the command
 * @returns {Promise<void>}
 */
exports.run = async (message, args) => {
    try {
        let time = await parseFloat(args[0]) * 60;

        if (!time) {
            await message.channel.send(newErrorEmbed(`I'm sorry, <@!${message.author.id}>...you must enter a number.`));
            return;
        }

        if (time > 20 * 60) {
            await message.channel.send(newErrorEmbed(`I'm sorry, <@!${message.author.id}>...delay is currently limited to a maximum of 20 minutes.`));
            return;
        }

        let cancelCountdown = false;
        let initiatingUser = `<@!${message.author.id}>`;
        let attentionUsers = [];
        let attendingUsers = new Map();

        for (let mention of await buildMentionsArray(message.mentions)) {
            attentionUsers.push(mention);
        }

        // Send a history report stating the delayed countdown lobby is initiated
        await message.channel.send(
            newCountdownHistoryEmbed(`A delayed countdown was initiated by ${initiatingUser}.`, config.embeds.images.initiateReadyCheckThumbnailUrl)
        );

        let timerMessageEmbed = newDelayedCountdownTimerEmbed(formatTimer(time));
        let timerMessage = await message.channel.send(timerMessageEmbed);
        let timerDelay = 5;

        let timerFunction = async () => {
            time -= timerDelay;
            timerMessage = await timerMessage.edit(newDelayedCountdownTimerEmbed(formatTimer(time)));
            if (time === 5) {
                timerDelay = 1;
                clearInterval(timerInterval);
                timerInterval = setInterval(timerFunction, timerDelay * 1000);

            } else if (time === 1) {
                clearInterval(timerInterval);
                timerMessage = await timerMessage.edit(newDelayedCountdownTimerEmbed('Here we go!'));

                if (!cancelCountdown) {
                    await timerMessage.delete();
                    await delayedCountdownMessage.delete();
                    await executeCountdown(message.channel, `A delayed countdown successfully completed.\n\nAttendees: ${Array.from(attendingUsers.keys()).join(', ')}`);
                }
            }
        };

        let timerInterval = setInterval(timerFunction, timerDelay * 1000);

        let delayedCountdownMessage = await message.channel.send(newDelayedCountdownLobbyEmbed(initiatingUser, attentionUsers, attendingUsers));

        await delayedCountdownMessage.react('🆗');
        await delayedCountdownMessage.react('🛑');

        config.client.on('messageReactionAdd', async(r, u) => {
            // Return if this message is not the delayedCountdownMessage
            if (r.message.id !== delayedCountdownMessage.id) return;

            // Just return if I placed the reaction
            if (u.id === config.client.user.id) return;

            // If the reaction is not OK or cancel, remove it and return
            if (!['🆗', '🛑'].includes(r.emoji.name)) {
                await r.users.remove(u.id);
                return;
            }

            switch (r.emoji.name) {
                case '🆗':
                    attendingUsers.set(`<@!${u.id}>`, true);
                    delayedCountdownMessage = await delayedCountdownMessage.edit(newDelayedCountdownLobbyEmbed(initiatingUser, attentionUsers, attendingUsers));
                    break;

                case '🛑':
                    if (u.id === message.author.id) {
                        await r.users.remove(u.id);
                        return;
                    }
                    cancelCountdown = true;
                    clearInterval(timerInterval);

                    await timerMessage.delete();
                    await delayedCountdownMessage.delete();

                    await message.channel.send(
                        newCountdownHistoryEmbed(`The delayed countdown was cancelled by <@!${u.id}>.`, config.embeds.images.cancelReadyCheckThumbnailUrl, 'DARK_RED')
                    );

                    break;
            }
        });

        // If a user removes their "ok" reaction, we need to remove them from the attendingUsers list
        config.client.on("messageReactionRemove", async(messageReaction, user) => {
            // Return if this message is not the delayedCountdownMessage
            if (messageReaction.message.id !== delayedCountdownMessage.id) return;

            if (messageReaction.emoji.name === '🆗') {
                attendingUsers.delete(`<@!${user.id}>`);
                delayedCountdownMessage = await delayedCountdownMessage.edit(newDelayedCountdownLobbyEmbed(initiatingUser, attentionUsers, attendingUsers));
            }
        });

    } catch (err) {
        log.error(`[/commands/delay.js] ${err}`);
    }
};

const formatTimer = (timer) => {
    return `${timer >= 60 ? `${Math.floor(timer / 60)} min ${timer % 60} sec` : `${timer} sec`}`;
};