// import { newClientReadyEmbed } from '../templates/embed.js';
import { newCreateSmangleLoungeEmbed } from '../templates/embed';
import { config }                      from '../conf/config';
import log                             from 'winston';

/**
 * Sets the bot's activity message after logging in.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async () => {
    try {
        log.info(`${config.client.user.username} has come online. Ready to serve in ${config.client.channels.cache.size} channels on ${config.client.guilds.cache.size} servers, for a total of ${config.client.users.cache.size} users.`);

        await config.client.user.setActivity(`${process.env.PREFIX} commands`, {type: "LISTENING"});

        for (let guild of config.client.guilds.cache.array()) {
            let smangleLounge = guild.channels.cache.find(channel => channel.name === 'smangle-lounge');

            if (!smangleLounge) {
                smangleLounge = await guild.channels.create('smangle-lounge', {
                    type: 'text',
                    reason: 'Everyone needs a place to smangle.'
                });
                await smangleLounge.send(newCreateSmangleLoungeEmbed());
            }

            // THE FOLLOWING CODE IS COMMENTED BECAUSE HEROKU RESTARTS EVERY 24 HOURS

            // This was causing a ready message to be sent to the general channel every day
            // We would ultimately like this to happen only when the bot gets re-deployed
            // This would allow for us to put patch notes in the ready message
            // But this cannot happen unless the bot is hosted somewhere other than Heroku

            // Actions to skip if testing the bot (like sending a message to general chat upon login)
            // if (process.env.NODE_ENV !== 'production') continue;

            // Find the configured 'general' channel for the server
            // const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');

            // Let the server know that I am online
            // generalChannel.send(newClientReadyEmbed());
        }

    } catch (err) {
        log.error(`[/events/ready.js] ${err}`);
    }
};
