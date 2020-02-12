import { executeCountdown } from '../templates/countdown';
import { newErrorEmbed } from '../templates/embed';
import { RichEmbed } from 'discord.js';
import messageConstants from '../../resources/message-constants'
import log from 'winston';

exports.run = async(client, message, args) => {
    try {
        let readyCheckUsersMap = new Map();
        let mentionsOutputArray = [];
        let readyUsers = [];
        let unreadyUsers = [];
        let alertMessages = [];

        // If the message contains any mentions, add them to the readyCheckUsersMap
        let mentionsArray = message.mentions.users.array();
        if (mentionsArray.length > 0) {
            readyCheckUsersMap.set(message.author, false);

            mentionsArray.forEach(user => {
                if (user !== message.author) {
                    readyCheckUsersMap.set(user, false);
                }
            });

        } else {
            return await message.channel.send(newErrorEmbed(client, `You can't ready with yourself, ${message.author.username}...mention some friends!`)).catch(err => log.error(err));
        }

        // Build a mentionsOutputArray by creating mentions for each user in the readyCheckUsersMap
        for (let [key, value] of readyCheckUsersMap.entries()) {
            mentionsOutputArray.push(`<@!${key.id}>`);
            value === true ? readyUsers.push(`<@!${key.id}>`) : unreadyUsers.push(`<@!${key.id}>`)
        }

        // Send the READY_UP alert, wait for the server to receive and return it, then save it
        let readyUpMessage = await message.channel.send(messageConstants.ALERT.READY_UP + mentionsOutputArray.join(", ")).catch(err => log.error(err));

        // Initialize the readyCheckLobby, wait for the server to receive and return it, then save it
        let readyCheckLobby = await setReadyCheckLobby(client, null, readyUsers, unreadyUsers, message);

        let reactionMenuEmojis = ['🆗', '🔄', '🛑', '🔔'];

        for (const emoji of reactionMenuEmojis) {
            // Add menu reactions to the readyUpMessage
            await readyCheckLobby.react(emoji);
        }

        // Create a reaction collector to handle menu actions
        let reactionCollector = readyCheckLobby.createReactionCollector(
            (reaction, user) => user !== client.user
        );
        reactionCollector.on('collect', async(reaction) => {
            let users = reaction.users;
            let invalidUser = false;

            // Remove reactions from anyone not in the readyUsersMap
            users.forEach(user => {
                if (!readyCheckUsersMap.has(user) && user !== client.user) {
                    reaction.remove(user.id);
                    invalidUser = true;
                }
            });
            if (invalidUser) return;

            // Remove any reactions that are not part of the menu
            if (!reactionMenuEmojis.includes(reaction.emoji.name)) {
                return users.forEach(user => {
                    reaction.remove(user.id);
                });
            }

            switch (reaction.emoji.name) {
                case '🆗':
                    users.forEach(user => {
                        if (user === client.user) return;
                        // Remove reaction if the user is not in the readyCheckUsersMap
                        if (!readyCheckUsersMap.has(user)) return reaction.remove(user.id);

                        readyCheckUsersMap.set(user, true);
                    });

                    readyUsers = [];
                    unreadyUsers = [];

                    for (let [key, value] of readyCheckUsersMap.entries()) {
                        value === true ? readyUsers.push(`<@!${key.id}>`) : unreadyUsers.push(`<@!${key.id}>`);
                    }

                    readyCheckLobby = await setReadyCheckLobby(client, readyCheckLobby, readyUsers, unreadyUsers, message);

                    if (readyUsers.length === readyCheckUsersMap.size) {
                        reactionCollector.stop();
                        let messagesToDelete = alertMessages;
                        messagesToDelete.push(readyUpMessage);
                        messagesToDelete.push(readyCheckLobby);

                        message.channel.bulkDelete(messagesToDelete).catch(err => console.log(err));

                        let hereWeGoMessage = await message.channel.send(messageConstants.ALERT.HERE_WE_GO + mentionsOutputArray.join(", "));
                        messagesToDelete.push(hereWeGoMessage);

                        message.channel.bulkDelete(messagesToDelete).catch(err => console.log(err));

                        return executeCountdown(client, message, `A countdown successfully completed for:\n${mentionsOutputArray.join(", ")}`);
                    }

                    break;

                case '🔄':
                    users.forEach(user => {
                        if (user === client.user) return;
                        reaction.remove(user.id);
                    });

                    readyCheckLobby.reactions.forEach(reaction => {
                        if (reaction.emoji.name === '🆗') {
                            reaction.users.forEach(user => {
                                if (user !== client.user) {
                                    reaction.remove(user.id);
                                }
                            });
                        }
                    });

                    message.channel.bulkDelete(alertMessages).catch(err => console.log(err));

                    break;

                case '🛑':
                    reactionCollector.stop();

                    let cancelUserList = [];
                    users.forEach(user => {
                        if (user !== client.user) {
                            cancelUserList.push(user.username)
                        }
                    });

                    let messagesToDelete = alertMessages;
                    messagesToDelete.push(readyUpMessage);
                    messagesToDelete.push(readyCheckLobby);
                    message.channel.bulkDelete(messagesToDelete).catch(err => console.log(err));

                    let cancelEmbed = new RichEmbed()
                        .setTitle(`ICS History Report`)
                        .setTimestamp()
                        .setDescription(`${cancelUserList.join(", ")} ${cancelUserList.length === 1 ? 'has' : 'have'} cancelled the countdown.`)
                        .setThumbnail("https://cdn.discordapp.com/attachments/387026235458584597/390386951557218315/dottedClose.gif")
                        .setAuthor(client.user.username, "https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png");

                    await message.channel.send(cancelEmbed);

                    break;

                case '🔔':
                    users.forEach(user => {
                        if (user !== client.user) {
                            reaction.remove(user.id);
                        }
                    });

                    let alertMessage = await message.channel.send(messageConstants.ALERT.READY_UP + unreadyUsers.join(", ")).catch(err => console.log(err));
                    alertMessages.push(alertMessage);

                    break;
            }
        });

        // If a user removes their "ok" reaction, we need to remove them from the readyUsers list and add them to the unreadyUsers list
        client.on("messageReactionRemove", async(messageReaction, user) => {
            if (messageReaction.emoji.name === '🆗' && readyCheckUsersMap.has(user)) {
                readyUsers = [];
                unreadyUsers = [];

                readyCheckUsersMap.set(user, false);

                for (let [key, value] of readyCheckUsersMap.entries()) {
                    value === true ? readyUsers.push(`<@!${key.id}>`) : unreadyUsers.push(`<@!${key.id}>`)
                }

                readyCheckLobby = await setReadyCheckLobby(client, readyCheckLobby, readyUsers, unreadyUsers, message);
            }
        });

    } catch (err) {
        log.error(`[/commands/now.js] ${err.message}`);
    }
};

// Send the readyCheckLobby to the server and return the message
const setReadyCheckLobby = async (client, readyCheckLobby, readyUsers, unreadyUsers, message) => {
    let readyCheckLobbyEmbed = new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage('https://cdn.discordapp.com/attachments/160594618478493696/677024135326466048/ics.gif')
        .addField("**Ready:**", `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`)
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", "): "Everyone is ready!"}`)
        .setAuthor(client.user.username, "https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png");

    if (readyCheckLobby == null) {
        return await message.channel.send(readyCheckLobbyEmbed).catch(err => console.log(err));
    } else {
        return await readyCheckLobby.edit(readyCheckLobbyEmbed).catch(err => console.log(err));
    }
};