import { newErrorEmbed,
         newCancelReadyCheckEmbed,
         newReadyCheckLobbyEmbed } from '../templates/embed';
import { executeCountdown }        from '../templates/countdown';
import { sleep }                   from '../utils/timer';
import messageConstants            from '../../resources/message-constants'
import log                         from 'winston';

/**
 * Creates a ready check lobby, complete with reaction-based menu system, and executes a countdown when everyone is ready.
 *
 * @param client the Discord client (the bot)
 * @param message the message requesting the ready check
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (client, message) => {
    try {
        // Gather any mentions attached to the ready check initiation message
        let mentionsArray = message.mentions.users.array();

        // If nobody was mentioned, send an error message to the channel and return
        if (mentionsArray.length === 0) {
            await message.channel.send(newErrorEmbed(`You can't ready with yourself, ${message.author.username}...mention some friends!`));
            return;
        }

        let readyCheckUsersMap = new Map();
        let mentionsOutputArray = [];
        let readyUsers = [];
        let unreadyUsers = [];
        let alertMessages = [];
        let reactionMenuEmojis = ['🆗', '🔄', '🛑', '🔔'];

        // Add the user that initiated the ready check to the map first
        readyCheckUsersMap.set(message.author.id, false);

        // Add the rest of the mentioned users to the map
        for (let user of mentionsArray) {
            // Don't add the user that created the ready check twice
            if (user.id === message.author.id) continue;
            readyCheckUsersMap.set(user.id, false);
        }

        // Build a mentionsOutputArray by creating mentions for each user in the readyCheckUsersMap
        for (let [key, value] of readyCheckUsersMap.entries()) {
            mentionsOutputArray.push(`<@!${key}>`);
            value === true ? readyUsers.push(`<@!${key}>`) : unreadyUsers.push(`<@!${key}>`)
        }

        // Send the READY_UP alert, wait for the server to receive and return it, then save it
        let readyUpMessage = await message.channel.send(messageConstants.ALERT.READY_UP + mentionsOutputArray.join(", "));

        let readyCheckLobbyEmbed = newReadyCheckLobbyEmbed(readyUsers, unreadyUsers);

        // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
        let readyCheckLobby = await message.channel.send(readyCheckLobbyEmbed);

        client.on('messageReactionAdd', async(reaction, user) => {
            if (reaction.message !== readyCheckLobby) return;

            if (user.id === client.user.id) return;

            let users = await reaction.users.array();
            let invalidUser = false;
            let invalidReaction = false;

            // Remove reactions from anyone not in the readyUsersMap
            for (let user of users) {
                if (user.id === client.user.id) continue;

                if (!readyCheckUsersMap.has(user.id)) {
                    await reaction.remove(user.id);
                    invalidUser = true;
                }
            }

            if (invalidUser) return;

            // Remove any reactions that are not part of the menu
            if (!reactionMenuEmojis.includes(reaction.emoji.name)) {
                for (let user of users) {
                    await reaction.remove(user.id);
                    invalidReaction = true;
                }
            }

            if (invalidReaction) return;

            switch (reaction.emoji.name) {
                case '🆗':
                    readyUsers = [];
                    unreadyUsers = [];

                    for (let user of users) {
                        if (user.id === client.user.id) continue;
                        await readyCheckUsersMap.set(user.id, true);
                    }

                    for (let [key, value] of readyCheckUsersMap.entries()) {
                        value === true ? readyUsers.push(`<@!${key}>`) : unreadyUsers.push(`<@!${key}>`);
                    }

                    readyCheckLobbyEmbed.fields[0].value = `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`;
                    readyCheckLobbyEmbed.fields[1].value = `${unreadyUsers.length > 0 ? unreadyUsers.join(", "): "Everyone is ready!"}`;

                    readyCheckLobby = await readyCheckLobby.edit(readyCheckLobbyEmbed);

                    if (Array.from(readyCheckUsersMap.values()).every(value => value === true)) {

                        let messagesToDelete = alertMessages;
                        messagesToDelete.push(readyUpMessage);
                        messagesToDelete.push(readyCheckLobby);
                        await message.channel.bulkDelete(messagesToDelete);

                        let hereWeGoMessage = await message.channel.send(messageConstants.ALERT.HERE_WE_GO + mentionsOutputArray.join(", "));

                        await sleep(2100);
                        await hereWeGoMessage.delete();

                        await executeCountdown(message, `A countdown successfully completed for:\n${mentionsOutputArray.join(", ")}`);
                    }

                    break;

                case '🔄':
                    // Delete all the lobby and alert messages
                    let messagesToDelete = alertMessages;
                    messagesToDelete.push(readyUpMessage);
                    messagesToDelete.push(readyCheckLobby);
                    await message.channel.bulkDelete(messagesToDelete);

                    readyUsers = [];
                    unreadyUsers = [];

                    for (let key of readyCheckUsersMap.keys()) {
                        readyCheckUsersMap.set(key, false);
                    }

                    for (let [key, value] of readyCheckUsersMap.entries()) {
                        value === true ? readyUsers.push(`<@!${key}>`) : unreadyUsers.push(`<@!${key}>`);
                    }

                    readyUpMessage = await message.channel.send(messageConstants.ALERT.READY_UP + mentionsOutputArray.join(", "));

                    readyCheckLobbyEmbed = newReadyCheckLobbyEmbed(readyUsers, unreadyUsers);

                    // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
                    readyCheckLobby = await message.channel.send(readyCheckLobbyEmbed);

                    for (let emoji of reactionMenuEmojis) {
                        // Add menu reactions to the readyUpMessage
                        await readyCheckLobby.react(emoji);
                    }

                    break;

                case '🛑':
                    let cancelUserList = [];
                    for (let user of users) {
                        if (user.id !== client.user.id) {
                            cancelUserList.push(user.username)
                        }
                    }

                    // Delete all the lobby and alert messages
                    await message.channel.bulkDelete([readyCheckLobby, readyUpMessage]);

                    // Send the cancel ready check embed
                    await message.channel.send(newCancelReadyCheckEmbed(`${cancelUserList.join(", ")} ${cancelUserList.length === 1 ? 'has' : 'have'} cancelled the countdown.`));

                    break;

                case '🔔':
                    let alertMessage = await message.channel.send(messageConstants.ALERT.READY_UP + unreadyUsers.join(", "));
                    alertMessages.push(alertMessage);

                    for (let user of users) {
                        if (user.id !== client.user.id) {
                            await reaction.remove(user.id);
                        }
                    }

                    break;
            }
        });

        // If a user removes their "ok" reaction, we need to remove them from the readyUsers list and add them to the unreadyUsers list
        client.on("messageReactionRemove", async(messageReaction, user) => {
            if (messageReaction.message !== readyCheckLobby) return;

            if (messageReaction.emoji.name === '🆗' && readyCheckUsersMap.has(user.id)) {
                readyUsers = [];
                unreadyUsers = [];

                readyCheckUsersMap.set(user.id, false);

                for (let [key, value] of readyCheckUsersMap.entries()) {
                    value === true ? readyUsers.push(`<@!${key}>`) : unreadyUsers.push(`<@!${key}>`)
                }

                readyCheckLobbyEmbed.fields[0].value = `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`;
                readyCheckLobbyEmbed.fields[1].value = `${unreadyUsers.length > 0 ? unreadyUsers.join(", "): "Everyone is ready!"}`;

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