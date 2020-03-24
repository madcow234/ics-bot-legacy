import { newClientUpgradeEmbed } from '../templates/embed';
import { version as appVersion } from '../../package';
import { addGuild }              from '../database/GuildService';
import { config }                from '../conf/config';
import log                       from 'winston';

/**
 * Sets the bot's activity message after logging in.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async () => {
    try {
        log.info(`${config.client.user.username} has come online. Ready to serve in ${config.client.channels.cache.size} channels on ${config.client.guilds.cache.size} servers, for a total of ${config.client.users.cache.size} users.`);

        await config.client.user.setActivity(`${process.env.PREFIX} commands`, {type: "LISTENING"});

        log.info(`Syncing database with client to check for missing guilds...`);
        for (let guild of config.client.guilds.cache.array()) {
            let guildInstance = await addGuild(guild);

            log.debug(`Checking if application version has changed since client was last active on guild '${guild.name}' (${guild.id})`);
            if (guildInstance.appVersion !== appVersion) {
                log.info(`Application version has changed for guild '${guild.name}' (${guild.id}) - Old version: ${guildInstance.appVersion}, New version: ${appVersion}`);

                let smangleLounge = guild.channels.cache.find(channel => channel.name === 'smangle-lounge');

                log.info(`Sending patch notes to channel 'smangle-lounge' in guild '${guild.name}' (${guild.id})`);
                await smangleLounge.send(newClientUpgradeEmbed(guildInstance.appVersion, appVersion));

                guildInstance.appVersion = appVersion;
                guildInstance.save();
                log.info(`Application version has been updated to ${appVersion} for guild '${guild.name}' (${guild.id})`)

            } else {
                log.debug(`Application version has not changed for guild '${guild.name}' (${guild.id})`);
            }
        }
        log.info(`Successfully added missing guilds`);

    } catch (err) {
        log.error(`[/events/ready.js] ${err}`);
    }
};