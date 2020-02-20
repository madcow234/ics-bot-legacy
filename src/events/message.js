import { config } from '../conf/config';
import { run }    from '../monitors/command-monitor';
import log        from 'winston';

/**
 * Listens to all messages and filters which ones should be sent to the command monitor.
 *
 * @param message the Discord message
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (message) => {
    try {
        // Don't respond to bots...unless I'm the one talking
        if (message.author.bot && message.author.id !== config.client.user.id) return;

        // Don't respond if the message doesn't start with the prefix
        if (!message.content.toLowerCase().startsWith(process.env.PREFIX.toLowerCase())) return;

        // Now we know the message is meant for us, so tokenize it into an array of arguments
        let args = message.content.trim().split(/ +/g);

        // Ensure that the first argument is exactly the prefix and not just startsWith
        // We do this because it is cheaper to check startsWith on every message
        // This allows us to have both !ics and !ics-test prefixes on separate bots
        // Essentially, this reduces the possible namespace collisions on the prefix
        if (args[0].toLowerCase() !== process.env.PREFIX.toLowerCase()) return;

        // Delete the command message
        await message.delete();

        // Remove the command prefix from the args list and send it to the command monitor
        await run(message, args.slice(1));

    } catch (err) {
        log.error(`[/events/message.js] ${err}`);
    }
};