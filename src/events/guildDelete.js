import { config } from '../conf/config';
import log        from 'winston';

/**
 * Removes a guild from the database if the client is kicked or the guild is deleted.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (guild) => {
    try {
        log.debug(`Heard event: guildDelete`);
        log.info(`Either the guild '${guild.name}' (${guild.id}) has been deleted or the bot was kicked from it`);

        log.debug(`Attempting to delete guild '${guild.name}' (${guild.id}) from database`);
        let serverInstance = await config.db.models.Guild.findOne({
            where: { guildId: guild.id }
        });

        if (serverInstance) {
            await serverInstance.destroy();
            log.info(`Successfully deleted guild '${guild.name}' (${guild.id}) from database`)

        } else {
            log.debug(`Guild '${guild.name}' (${guild.id}) does not exist in database, no need to delete`);
        }

    } catch (err) {
        log.error(`[/events/guildDelete.js] ${err}`);
    }
};
