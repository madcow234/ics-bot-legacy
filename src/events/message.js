import log from 'winston';

exports.run = async(client, message) => {
    try {
        // Don't respond to bots...unless I'm the one talking
        if (message.author.bot && message.author.id !== client.user.id) return;

        // Execute the commandsMonitor if the configured prefix is heard
        if (message.content.startsWith(process.env.PREFIX)) {
            let args = message.content.trim().split(/ +/g);

            // Ensure that the first argument is exactly the prefix and not just startsWith
            // We do this because it is cheaper to check startsWith on every message
            if (args[0] !== process.env.PREFIX) return;

            require('../monitors/command-monitor.js').run(client, message, args.slice(1));
        }

    } catch (err) {
        log.error(`[/events/message.js] ${err.message}`);
    }
};