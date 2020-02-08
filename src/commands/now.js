import { executeCountdown } from '../templates/countdown';
import log from 'winston';

exports.run = async(client, message, args) => {
    try {
        await executeCountdown(client, message, `An instant countdown successfully completed.`);

    } catch (err) {
        log.error(`[/commands/now.js] ${err.message}`);
    }
};