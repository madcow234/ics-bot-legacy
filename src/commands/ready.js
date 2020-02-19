import { newErrorEmbed,
         newCancelReadyCheckEmbed,
         newReadyCheckLobbyWithPreparingEmbed,
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
            await message.channel.send(newErrorEmbed(`You can't ready with yourself, ${message.author.username}...mention some friends!`));
            return;
        }

        let client = config.client;
        let readyCheckUsersMap = new Map();
        let mentionsOutputArray = [];
        let readyUsers = [];
        let preparingUsers = [];
        let unreadyUsers = [];
        let messagesToDelete = [];
        let reactionMenuEmojis = ['🆗', '*️⃣', '🔄', '🛑', '🔔'];

        // Add the user that initiated the ready check to the map first
        readyCheckUsersMap.set(message.author.id, false);
        mentionsOutputArray.push(`<@!${message.author.id}>`);
        unreadyUsers.push(`<@!${message.author.id}>`);

        // Add the rest of the mentioned users to the map
        for (let user of mentionsArray) {
            // Don't add the user that created the ready check twice
            if (user.id === message.author.id) continue;
            readyCheckUsersMap.set(user.id, false);
            mentionsOutputArray.push(`<@!${user.id}>`);
            unreadyUsers.push(`<@!${user.id}>`);
        }

        let readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

        // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
        let readyCheckLobby = await message.channel.send(readyCheckLobbyEmbed);

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
                    let asterisk = readyCheckLobby.reactions.get('*️⃣');
                    await asterisk.remove(user.id);

                    unreadyUsers = unreadyUsers.filter(value => {
                        return value !== `<@!${user.id}>`;
                    });
                    preparingUsers = preparingUsers.filter(value => {
                        return value !== `<@!${user.id}>`;
                    });

                    readyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, true);

                    readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

                    readyCheckLobby = await readyCheckLobby.edit(readyCheckLobbyEmbed);

                    if (Array.from(readyCheckUsersMap.values()).every(value => value === true)) {

                        await readyCheckLobby.delete();
                        await message.channel.bulkDelete(messagesToDelete);

                        let hereWeGoMessage = await message.channel.send(messageConstants.ALERT.HERE_WE_GO + mentionsOutputArray.join(", "));

                        await sleep(2100);
                        await hereWeGoMessage.delete();

                        await executeCountdown(message, `A countdown successfully completed for:\n${mentionsOutputArray.join(", ")}`);
                    }

                    break;

                case '*️⃣':
                    let ok = readyCheckLobby.reactions.get('🆗');
                    await ok.remove(user.id);

                    unreadyUsers = unreadyUsers.filter(value => {
                        return value !== `<@!${user.id}>`;
                    });
                    readyUsers = readyUsers.filter(value => {
                        return value !== `<@!${user.id}>`;
                    });

                    preparingUsers.push(`<@!${user.id}>`);

                    readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

                    readyCheckLobby = await readyCheckLobby.edit(readyCheckLobbyEmbed);

                    break;

                case '🔄':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);

                    readyUsers = [];
                    preparingUsers = [];
                    unreadyUsers = [];

                    for (let key of readyCheckUsersMap.keys()) {
                        readyCheckUsersMap.set(key, false);
                    }

                    unreadyUsers = mentionsOutputArray;

                    readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

                    // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
                    readyCheckLobby = await message.channel.send(readyCheckLobbyEmbed);

                    for (let emoji of reactionMenuEmojis) {
                        // Add menu reactions to the readyUpMessage
                        await readyCheckLobby.react(emoji);
                    }

                    break;

                case '🛑':
                    await readyCheckLobby.delete();
                    await message.channel.bulkDelete(messagesToDelete);
                    await message.channel.send(newCancelReadyCheckEmbed(`The countdown was cancelled by <@!${user.id}>.`));
                    break;

                case '🔔':
                    let alertUsers = unreadyUsers.concat(preparingUsers);
                    messagesToDelete.push(await message.channel.send(messageConstants.ALERT.READY_UP + alertUsers.join(", ")));
                    await reaction.remove(user.id);
                    break;
            }
        });

        // If a user removes their "ok" reaction, we need to remove them from the readyUsers list and add them to the unreadyUsers list
        client.on("messageReactionRemove", async(messageReaction, user) => {
            if (messageReaction.message !== readyCheckLobby) return;

            if (messageReaction.emoji.name === '🆗') {
                readyUsers = readyUsers.filter(value => {
                    return value !== `<@!${user.id}>`;
                });

                let asterisk = readyCheckLobby.reactions.get('*️⃣');
                if (!asterisk.users.has(user.id)) {
                    unreadyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, false);
                }

                readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

                readyCheckLobby = await readyCheckLobby.edit(readyCheckLobbyEmbed);

            } else if (messageReaction.emoji.name === '*️⃣') {
                preparingUsers = preparingUsers.filter(value => {
                    return value !== `<@!${user.id}>`;
                });

                let ok = readyCheckLobby.reactions.get('🆗');
                if (!ok.users.has(user.id)) {
                    unreadyUsers.push(`<@!${user.id}>`);
                    readyCheckUsersMap.set(user.id, false);
                }

                readyCheckLobbyEmbed = getReadyCheckLobbyEmbed(readyUsers, preparingUsers, unreadyUsers);

                readyCheckLobby = await readyCheckLobby.edit(readyCheckLobbyEmbed);
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

const getReadyCheckLobbyEmbed = (readyUsers, preparingUsers, unreadyUsers) => {
    if (preparingUsers.length) {
        return newReadyCheckLobbyWithPreparingEmbed(readyUsers, preparingUsers, unreadyUsers)
    } else {
        return newReadyCheckLobbyEmbed(readyUsers, unreadyUsers)
    }
};