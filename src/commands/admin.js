import log from 'winston';

/**
 *
 */
exports.run = async (message, args) => {
    try {

       // TODO add ability for guild admins to configure the thumbnail for each embed

    } catch (err) {
        log.error(`[/commands/admin.js] ${err}`);
    }
};