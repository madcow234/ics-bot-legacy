import { newCreateSmangleLoungeEmbed } from '../templates/embed';
import { version as appVersion }       from '../../package';
import { config }                      from '../conf/config';
import log                             from 'winston';

/**
 * Adds a Guild to the database. Also adds a new channel 'smangle-lounge' if it does not yet exist on the Guild.
 *
 * @param guild the Guild to add to the database
 * @returns {Promise<any>} guildInstance the instance of the Guild
 */
exports.addGuild = async (guild) => {
    try {
        log.debug(`Checking database for guild '${guild.name}' (${guild.id})...`);
        let guildInstance = await config.db.models.Guild.findOne({
            where: { guildId: guild.id }
        });

        if (guildInstance) {
            log.info(`Guild '${guild.name}' (${guild.id}) already exists in database`);

        } else {
            log.debug(`Attempting to add guild '${guild.name}' (${guild.id}) to database...`);
            guildInstance = await config.db.Guild.create({
                guildId: guild.id,
                appVersion: appVersion
            });

            log.info(`Successfully added guild '${guild.name}' (${guild.id}) to database`)
        }

        log.debug(`Checking for existing channel 'smangle-lounge' in guild '${guild.name}' (${guild.id})`);
        let smangleLounge = guild.channels.cache.find(channel => channel.name === 'smangle-lounge');

        if (!smangleLounge) {
            log.debug(`Did not find existing channel 'smangle-lounge' in guild '${guild.name}' (${guild.id})...creating now`);

            // This inspection is disabled because WebStorm wants the "type" to be "voice" for some reason
            // noinspection JSCheckFunctionSignatures
            smangleLounge = await guild.channels.create('smangle-lounge', {
                type: 'text',
                reason: 'Everyone needs a place to smangle.'
            });

            await smangleLounge.send(newCreateSmangleLoungeEmbed());
            log.info(`Successfully created channel 'smangle-lounge' in guild '${guild.name}' (${guild.id})`)

        } else {
            log.debug(`Found existing channel 'smangle-lounge' in guild '${guild.name}' (${guild.id})...no need to create.`)
        }

        return guildInstance;

    } catch (err) {
        log.error(`[/database/GuildService.js] ${err}`);
    }
};