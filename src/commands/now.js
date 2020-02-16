import { executeCountdown } from '../templates/countdown';
import log                  from 'winston';

/**
 * Immediately executes a countdown.
 *
 * @param client the Discord client (the bot)
 * @param message the message requesting the instant countdown
 * @returns {Promise<void>}
 */
exports.run = async (client, message) => {
    try {
        await executeCountdown(message, `An instant countdown successfully completed.`);

    } catch (err) {
        log.error(`[/commands/now.js] ${err}`);
    }
};