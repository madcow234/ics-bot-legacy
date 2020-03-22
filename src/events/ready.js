import { newClientUpgradeEmbed,
         newCreateSmangleLoungeEmbed } from '../templates/embed';
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
                // This inspection is disabled because WebStorm wants the "type" to be "voice" for some reason
                // noinspection JSCheckFunctionSignatures
                smangleLounge = await guild.channels.create('smangle-lounge', {
                    type: 'text',
                    reason: 'Everyone needs a place to smangle.'
                });
                smangleLounge = await smangleLounge.send(newCreateSmangleLoungeEmbed());
            }

            let serverInstance = await config.db.models.Server.findOne({
                where: { guild: guild.id }
            });

            if (serverInstance) {
                if (serverInstance.appVersion !== process.env.NPM_PACKAGE_VERSION) {
                    smangleLounge = await smangleLounge.send(newClientUpgradeEmbed());
                    serverInstance.appVersion = process.env.NPM_PACKAGE_VERSION;
                    serverInstance.save();
                }
            } else {
                serverInstance = await config.db.Server.create({
                    guild: guild.id,
                    appVersion: process.env.NPM_PACKAGE_VERSION,
                });
            }
        }

    } catch (err) {
        log.error(`[/events/ready.js] ${err}`);
    }
};
