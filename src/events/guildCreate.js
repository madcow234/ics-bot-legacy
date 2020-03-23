import { addGuild } from '../database/GuildService';
import log          from 'winston';

/**
 * Removes a guild from the database if the client is kicked or the guild is deleted.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (guild) => {
    try {
        log.debug(`Heard event: guildCreate`);
        log.info(`The client has been added to guild '${guild.name}' (${guild.id})`);

        await addGuild(guild);

    } catch (err) {
        log.error(`[/events/guildCreate.js] ${err}`);
    }
};
