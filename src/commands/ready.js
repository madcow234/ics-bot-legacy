import { newErrorEmbed,
         newCountdownHistoryEmbed,
         newReadyCheckLobbyEmbed } from '../templates/embed';
import { executeCountdown }        from '../templates/countdown';
import { config }                  from '../conf/config';
import { sleep }                   from '../utils/timer';
import messageConstants            from '../../resources/message-constants'
import log                         from 'winston';

/**
 * Creates a ready check lobby, complete with reaction-based menu system, and executes a countdown when everyone is ready.
 *
 * @param message the message requesting the ready check
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (message) => {
    try {
        // Gather any mentions attached to the ready check initiation message
        let mentionsArray = message.mentions.users.array();

        // If nobody was mentioned, send an error message to the channel and return
        if (mentionsArray.length === 0) {
            await message.channel.send(
                newErrorEmbed(`You can't ready with yourself, ${message.author.username}...mention some friends!`)
            );
            return;
        }

        let client = config.client;
        let initiatingUser = message.author.id;
        let readyCheckUsersMap = new Map();
        let mentionsOutputArray = [];
        let readyUsers = [];
        let preparingUsers = [];
        let unreadyUsers = [];
        let messagesToDelete = [];
        let reactionMenuEmojis = ['🆗', '*️⃣', '🔔', '🔄', '❌', '🛑'];

        // Add the user that initiated the ready check to the map first
        readyCheckUsersMap.set(initiatingUser, false);
        mentionsOutputArray.push(`<@!${initiatingUser}>`);
        unreadyUsers.push(`<@!${initiatingUser}>`);

        // Add the rest of the mentioned users to the map
        for (let user of mentionsArray) {
            // Don't add the user that created the ready check twice
            if (user.id === initiatingUser) continue;
            readyCheckUsersMap.set(user.id, false);
            mentionsOutputArray.push(`<@!${user.id}>`);
            unreadyUsers.push(`<@!${user.id}>`);
        }

        let participants = mentionsOutputArray.length > 1 ? mentionsOutputArray.slice(1).join(', ') : `<@!${initiatingUser}>`;
        // Send a history report stating the ready check lobby is initiated
        await message.channel.send(
            newCountdownHistoryEmbed(`A ready check lobby was initiated by <@!${initiatingUser}>.\n\nParticipants: ${participants}`, config.embeds.images.animatedIcsBotThumbnailUrl)
        );

        await sleep(100);
        // Send the initial ready check lobby
        let readyCheckLobby = await message.channel.send(
            newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
        );

        // This event will fire every time any user adds any reaction to any message on any server this bot is on
        client.on('messageReactionAdd', async(reaction, user) => {
            // Immediately return if the reaction is not part of the ready check lobby
            if (reaction.message !== readyCheckLobby) return;

            // Return if this bot added the reaction
            if (user.id === client.user.id) return;

            // Remove reaction if the user is not in the readyUsersMap or the reaction is not part of the menu
            if (!readyCheckUsersMap.has(user.id) || !reactionMenuEmojis.includes(reaction.emoji.name)) {
                await reaction.remove(user.id);
                return;
            }

            switch (reaction.emoji.name) {
                case '🆗':
                    await readyCheckLobby.reactions.get('*️⃣').remove(user.id);

                    [preparingUsers, unreadyUsers] = await removeUserFromLists(user.id, [preparingUsers, unreadyUsers]);

                    readyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, true);

                    readyCheckLobby = await readyCheckLobby.edit(
                        newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                    );

                    if (Array.from(readyCheckUsersMap.values()).every(value => value === true)) {

                        await readyCheckLobby.delete();
                        await message.channel.bulkDelete(messagesToDelete);

                        let hereWeGoMessage = await message.channel.send(messageConstants.ALERT.HERE_WE_GO + mentionsOutputArray.join(", "));

                        await sleep(2100);
                        await hereWeGoMessage.delete();

                        await executeCountdown(message.channel, `The countdown successfully completed for:\n${mentionsOutputArray.join(", ")}`);
                    }

                    break;

                case '*️⃣':
                    await readyCheckLobby.reactions.get('🆗').remove(user.id);

                    [readyUsers, unreadyUsers] = await removeUserFromLists(user.id, [readyUsers, unreadyUsers]);

                    preparingUsers.push(`<@!${user.id}>`);

                    readyCheckLobby = await readyCheckLobby.edit(
                        newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                    );

                    break;

                case '❌':
                    [readyUsers, preparingUsers, unreadyUsers, mentionsOutputArray] = await removeUserFromLists(user.id, [readyUsers, preparingUsers, unreadyUsers, mentionsOutputArray]);

                    readyCheckUsersMap.delete(user.id);

                    if (readyCheckUsersMap.size > 0) {
                        if (Array.from(readyCheckUsersMap.values()).every(value => value === true)) {
                            await readyCheckLobby.delete();
                            await message.channel.bulkDelete(messagesToDelete);

                            let hereWeGoMessage = await message.channel.send(messageConstants.ALERT.HERE_WE_GO + mentionsOutputArray.join(", "));

                            await sleep(2100);
                            await hereWeGoMessage.delete();

                            await executeCountdown(message.channel, `The countdown successfully completed for:\n${mentionsOutputArray.join(", ")}`);

                        } else {
                            await readyCheckLobby.reactions.get('🆗').remove(user.id);
                            await readyCheckLobby.reactions.get('*️⃣').remove(user.id);
                            await readyCheckLobby.reactions.get('❌').remove(user.id);

                            readyCheckLobby = await readyCheckLobby.edit(
                                newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                            );
                        }

                    } else {
                        await readyCheckLobby.delete();
                        await message.channel.bulkDelete(messagesToDelete);
                        await message.channel.send(
                            newCountdownHistoryEmbed(`The ready check was cancelled because everyone left the lobby.`, config.embeds.images.cancelReadyCheckThumbnailUrl)
                        );
                    }

                    break;

                case '🔄':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);

                    await message.channel.send(
                        newCountdownHistoryEmbed(`The lobby was restarted by <@!${user.id}>.`, config.embeds.images.animatedIcsBotThumbnailUrl)
                    );

                    readyUsers = [];
                    preparingUsers = [];
                    unreadyUsers = [];

                    for (let key of readyCheckUsersMap.keys()) {
                        readyCheckUsersMap.set(key, false);
                    }

                    unreadyUsers = mentionsOutputArray;

                    await sleep(100);
                    // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
                    readyCheckLobby = await message.channel.send(
                        newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                    );

                    for (let emoji of reactionMenuEmojis) {
                        // Add menu reactions to the readyUpMessage
                        await readyCheckLobby.react(emoji);
                    }

                    break;

                case '🛑':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);
                    await message.channel.send(
                        newCountdownHistoryEmbed(`The ready check was cancelled by <@!${user.id}>.`, config.embeds.images.cancelReadyCheckThumbnailUrl)
                    );
                    break;

                case '🔔':
                    let alertUsers = unreadyUsers.concat(preparingUsers);
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

            if (!readyCheckUsersMap.has(user.id)) return;

            if (messageReaction.emoji.name === '🆗') {
                [readyUsers] = await removeUserFromLists(user.id, [readyUsers]);

                let asterisk = readyCheckLobby.reactions.get('*️⃣');
                if (!asterisk.users.has(user.id)) {
                    unreadyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, false);
                }

                readyCheckLobby = await readyCheckLobby.edit(
                    newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                );

            } else if (messageReaction.emoji.name === '*️⃣') {
                [preparingUsers] = await removeUserFromLists(user.id, [preparingUsers]);

                let ok = readyCheckLobby.reactions.get('🆗');
                if (!ok.users.has(user.id)) {
                    unreadyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, false);
                }

                readyCheckLobby = await readyCheckLobby.edit(
                    newReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers)
                );
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

const removeUserFromLists = async (userId, lists) => {
    let newLists = [];
    while (lists.length > 0) {
        let list = lists.pop();
        list = list.filter(value => {
            return value !== `<@!${userId}>`;
        });
        newLists.unshift(list);
    }
    return newLists;
};