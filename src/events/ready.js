import { newClientReadyEmbed } from '../templates/embed.js';
import log                     from 'winston';

export async function run(client) {
    try {
        log.info(`${client.user.username} has come online. Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);

        await client.user.setActivity(`${process.env.PREFIX} commands`, {type: "LISTENING"});


        // THE FOLLOWING CODE IS COMMENTED BECAUSE HEROKU KEEPS RESTARTING EVERY 24 HOURS
        // This was causing a ready message to be sent to the general channel every day
        // I would ultimately like this to happen only when the bot gets re-deployed
        // This would allow for me to put patch notes in the ready message

        // Actions to skip if testing the bot (like sending a message to general chat upon login)
        // if (process.env.NODE_ENV !== 'production') return;

        // Find the configured 'general' channel for the server
        // const generalChannel = client.channels.find(val => val.name === 'general');

        // Let the server know that I am online
        // generalChannel.send(newClientReadyEmbed(client)).catch(err => log.error(err.message));

    } catch (err) {
        log.error(`[/events/ready.js] ${err.message}`);
    }
}
