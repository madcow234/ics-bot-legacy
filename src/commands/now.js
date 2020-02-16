import { executeCountdown } from '../templates/countdown';
import log                  from 'winston';

exports.run = async (client, message) => {
    try {
        await executeCountdown(message, `An instant countdown successfully completed.`);

    } catch (err) {
        log.error(`[/commands/now.js] ${err}`);
    }
};