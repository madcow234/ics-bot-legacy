import { newErrorEmbed,
         newCountdownHistoryEmbed,
         newReadyCheckLobbyEmbed} from '../templates/embed';
import { executeCountdown }        from '../templates/countdown';
import { config }                  from '../conf/config';
import { sleep }                   from '../utils/timer';
import messageConstants            from '../../resources/message-constants'
import log                         from 'winston';

/**
 * Creates a ready check lobby, complete with reaction-based menu system, and executes a countdown when everyone is ready.
 *
 * @param message the message requesting the ready check
 * @param args a list of any arguments passed with the command
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (message, args) => {
    try {
        let reactionMenuEmojis = ['🆗', '*️⃣', '🔔', '🔄', '❌', '🛑'];
        let client = config.client;
        let mentionsArray = [];

        // If the --crew argument is used, gather the configured crew users
        if (args.includes('-c') || args.includes('--crew')) {
            for (let crewId of config.crew) {
                mentionsArray.push(await client.fetchUser(crewId));
            }
        }

        // Gather any mentions attached to the ready check initiation message
        for (let user of message.mentions.users.array()) {
            if (!mentionsArray.includes(user)) {
                mentionsArray.push(user);
            }
        }

        // Gather any roles attached to the ready check initiation message
        for (let role of message.mentions.roles.array()) {
            for (let member of role.members.array()) {
                if (!mentionsArray.includes(member.user)) {
                    mentionsArray.push(member.user);
                }
            }
        }

        // If nobody was mentioned, send an error message to the channel and return
        if (mentionsArray.length === 0) {
            await message.channel.send(
                newErrorEmbed(`You can't ready with yourself, <@!${message.author.id}>...mention some friends!`)
            );
            return;
        }

        let initiatingUser = message.author.id;
        let userStateMap = new Map();
        let messagesToDelete = [];

        // Add the user that initiated the ready check to the map first
        // This allows the initiating user to not have to mention themselves
        userStateMap.set(`<@!${initiatingUser}>`, config.enums.userStates.INACTIVE);

        // Add the rest of the mentioned users to the map
        for (let user of mentionsArray) {
            // Don't add the user that created the ready check twice
            if (user.id === initiatingUser) continue;
            userStateMap.set(`<@!${user.id}>`, config.enums.userStates.INACTIVE);
        }

        let participants = Array.from(userStateMap.keys()).length > 1 ? Array.from(userStateMap.keys()).slice(1).join(', ') : `<@!${initiatingUser}>`;

        // Send a history report stating the ready check lobby is initiated
        await message.channel.send(
            newCountdownHistoryEmbed(`A ready check lobby was initiated by <@!${initiatingUser}>.\n\nOther participants: ${participants}`, config.embeds.images.initiateReadyCheckThumbnailUrl)
        );

        await sleep(100);
        // Send the initial ready check lobby
        let readyCheckLobby = await message.channel.send(newReadyCheckLobbyEmbed(userStateMap));

        // This event will fire every time any user adds any reaction to any message on any server this bot is on
        client.on('messageReactionAdd', async(reaction, user) => {
            // Immediately return if the reaction is not part of the ready check lobby
            if (reaction.message !== readyCheckLobby) return;

            // Return if this bot added the reaction
            if (user.id === client.user.id) return;

            // Remove reaction if the user is not in the readyUsersMap or the reaction is not part of the menu
            if (!userStateMap.has(`<@!${user.id}>`) || !reactionMenuEmojis.includes(reaction.emoji.name)) {
                await reaction.remove(user.id);
                return;
            }

            switch (reaction.emoji.name) {
                case '🆗':
                    await readyCheckLobby.reactions.get('*️⃣').remove(user.id);

                    userStateMap.set(`<@!${user.id}>`, config.enums.userStates.READY);

                    readyCheckLobby = await readyCheckLobby.edit(newReadyCheckLobbyEmbed(userStateMap));

                    if (Array.from(userStateMap.values()).every(value => value === config.enums.userStates.READY)) {
                        await startCountdown(readyCheckLobby, userStateMap, messagesToDelete);
                    }

                    break;

                case '*️⃣':
                    await readyCheckLobby.reactions.get('🆗').remove(user.id);

                    userStateMap.set(`<@!${user.id}>`, config.enums.userStates.PREPARING);

                    readyCheckLobby = await readyCheckLobby.edit(newReadyCheckLobbyEmbed(userStateMap));

                    break;

                case '❌':
                    userStateMap.delete(`<@!${user.id}>`);

                    if (userStateMap.size > 0) {
                        if (Array.from(userStateMap.values()).every(value => value === config.enums.userStates.READY)) {
                            await startCountdown(readyCheckLobby, userStateMap, messagesToDelete);

                        } else {
                            await readyCheckLobby.reactions.get('🆗').remove(user.id);
                            await readyCheckLobby.reactions.get('*️⃣').remove(user.id);
                            await readyCheckLobby.reactions.get('❌').remove(user.id);

                            readyCheckLobby = await readyCheckLobby.edit(newReadyCheckLobbyEmbed(userStateMap));
                        }

                    } else {
                        await readyCheckLobby.delete();
                        await message.channel.bulkDelete(messagesToDelete);
                        await message.channel.send(
                            newCountdownHistoryEmbed(`The ready check was cancelled because everyone left the lobby.`, config.embeds.images.noParticipantsReadyCheckThumbnailUrl, 'DARK_RED')
                        );
                    }

                    break;

                case '🔄':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);

                    await message.channel.send(
                        newCountdownHistoryEmbed(`The lobby was restarted by <@!${user.id}>.`, config.embeds.images.restartReadyCheckThumbnailUrl, 'DARK_ORANGE')
                    );

                    for (let key of userStateMap.keys()) {
                        userStateMap.set(key, config.enums.userStates.INACTIVE);
                    }

                    await sleep(100);
                    // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
                    readyCheckLobby = await message.channel.send(newReadyCheckLobbyEmbed(userStateMap));

                    for (let emoji of reactionMenuEmojis) {
                        // Add menu reactions to the readyUpMessage
                        await readyCheckLobby.react(emoji);
                    }

                    break;

                case '🛑':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);
                    await message.channel.send(
                        newCountdownHistoryEmbed(`The ready check was cancelled by <@!${user.id}>.`, config.embeds.images.cancelReadyCheckThumbnailUrl, 'DARK_RED')
                    );
                    break;

                case '🔔':
                    let alertUsers = [];
                    for (let [user, state] of userStateMap) {
                        if (state === config.enums.userStates.INACTIVE || state === config.enums.userStates.PREPARING) {
                            alertUsers.push(user);
                        }
                    }
                    messagesToDelete.push(
                        await message.channel.send(messageConstants.ALERT.READY_UP + alertUsers.join(", "))
                    );
                    await reaction.remove(user.id);
                    break;
            }
        });

        // If a user removes their "ok" reaction, we need to remove them from the readyUsers list and add them to the unreadyUsers list
        client.on("messageReactionRemove", async(messageReaction, user) => {
            if (messageReaction.message !== readyCheckLobby) return;

            if (!userStateMap.has(`<@!${user.id}>`)) return;

            if (messageReaction.emoji.name === '🆗' || messageReaction.emoji.name === '*️⃣') {
                userStateMap.set(`<@!${user.id}>`, config.enums.userStates.INACTIVE);

                readyCheckLobby = await readyCheckLobby.edit(newReadyCheckLobbyEmbed(userStateMap));
            }
        });

        for (let emoji of reactionMenuEmojis) {
            // Add menu reactions to the readyUpMessage
            await readyCheckLobby.react(emoji);
        }

    } catch (err) {
        log.error(`[/commands/ready.js] ${err}`);
    }
};

const startCountdown = async (readyCheckLobby, userStateMap, messagesToDelete) => {
    await readyCheckLobby.delete();
    await readyCheckLobby.channel.bulkDelete(messagesToDelete);

    let hereWeGoMessage = await readyCheckLobby.channel.send(messageConstants.ALERT.HERE_WE_GO + Array.from(userStateMap.keys()).join(", "));

    await sleep(2100);
    await hereWeGoMessage.delete();

    await executeCountdown(readyCheckLobby.channel, `The countdown successfully completed for:\n${Array.from(userStateMap.keys()).join(", ")}`);
};