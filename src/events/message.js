import log from 'winston';

exports.run = async(client, message) => {
    try {
        const config = require('../../config.json');

        // Don't respond to bots...unless I'm the one talking
        if (message.author.bot && message.author.id !== client.user.id) return;

        // Get the command prefix from config and append a suffix if we're not in production
        let commandPrefix = config.prefix;
        if (process.env.NODE_ENV !== 'production') commandPrefix = 'test-' + commandPrefix;

        // Execute the commandsMonitor if the configured prefix is heard
        if (message.content.startsWith(commandPrefix)) {
            // require('../monitors/commandsMonitor.js').run(client, message);
            await message.reply('Smangle time!');
        }

    } catch (err) {
        log.error(`[/events/message.js] ${err.message}`);
    }
};