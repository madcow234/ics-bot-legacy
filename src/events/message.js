import log from 'winston';

exports.run = async(client, message) => {
    try {
        // Don't respond to bots...unless I'm the one talking
        if (message.author.bot && message.author.id !== client.user.id) return;

        // Don't respond if the message doesn't start with the prefix
        if (!message.content.startsWith(process.env.PREFIX)) return;

        // Tokenize the message into an array of arguments
        let args = message.content.trim().split(/ +/g);

        // Ensure that the first argument is exactly the prefix and not just startsWith
        // We do this because it is cheaper to check startsWith on every message
        // This allows us to have both !ics and !ics-test prefixes on separate bots
        if (args[0] !== process.env.PREFIX) return;

        message.delete();

        require('../monitors/command-monitor.js').run(client, message, args.slice(1));

    } catch (err) {
        log.error(`[/events/message.js] ${err.message}`);
    }
};