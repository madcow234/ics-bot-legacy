//import { newClientReadyEmbed } from '../templates/embed.js';
import { newCreateSmangleLoungeEmbed } from '../templates/embed';
import log                             from 'winston';

/**
 * Sets the bot's activity message after logging in.
 *
 * @param client the Discord client (the bot)
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (client) => {
    try {
        log.info(`${client.user.username} has come online. Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);

        await client.user.setActivity(`${process.env.PREFIX} commands`, {type: "LISTENING"});

        for (let guild of client.guilds.array()) {
            let smangleLounge = guild.channels.find(channel => channel.name === 'smangle-lounge');

            if (!smangleLounge) {
                smangleLounge = await guild.createChannel('smangle-lounge', {
                    type: 'text',
                    reason: 'Everyone needs a place to smangle.'
                });
                await smangleLounge.send(newCreateSmangleLoungeEmbed());
            }
        }

        // THE FOLLOWING CODE IS COMMENTED BECAUSE HEROKU RESTARTS EVERY 24 HOURS

        // This was causing a ready message to be sent to the general channel every day
        // We would ultimately like this to happen only when the bot gets re-deployed
        // This would allow for us to put patch notes in the ready message
        // But this cannot happen unless the bot is hosted somewhere other than Heroku

        // Actions to skip if testing the bot (like sending a message to general chat upon login)
        // if (process.env.NODE_ENV !== 'production') return;

        // Find the configured 'general' channel for the server
        // const generalChannel = client.channels.find(val => val.name === 'general');

        // Let the server know that I am online
        // generalChannel.send(newClientReadyEmbed());

    } catch (err) {
        log.error(`[/events/ready.js] ${err}`);
    }
};
