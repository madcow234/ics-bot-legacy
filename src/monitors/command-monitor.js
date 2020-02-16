import { newErrorEmbed } from '../templates/embed.js'
import { getCommands }   from '../commands'
import log               from 'winston';

/**
 * Executes the proper command requested by the supplied message.
 *
 * @param message the command message
 * @param args a list of any arguments passed with the command
 * @returns {Promise<void>} an empty Promise
 */
exports.run = async (message, args) => {
    try {
        // If the command does not contain any arguments, send an error message and return
        if (args.length === 0) {
            await message.channel.send(newErrorEmbed(`Hi ${message.author.username}! I'm doing well, but I can't help you if you don't issue a command.`));
            return;
        }

        // Read the /commands/ folder and create a list of available commands to verify user-issued commands against
        // This is very important because the required commandFile below relies on user input to call a file, which can be very dangerous
        // We need to ensure that ONLY commands already available in the /commands/ folder actually load a file
        let availableCommands = await getCommands();

        // Log a warning if there are no files in the directory
        if (availableCommands.length === 0) {
            await message.channel.send(newErrorEmbed(`I'm so confused...I can't remember any commands right now.`));
            return;
        }

        // Exit and notify the user if they attempted to issue a command that is not available in the /commands/ folder
        if (availableCommands.lastIndexOf(args[0]) === -1) {
            await message.channel.send(newErrorEmbed(`I'm sorry, '${args[0]}' is not a valid command.`));
            return;
        }

        // Execute the proper command file
        let commandFile = require(`../commands/${args[0]}.js`);
        await commandFile.run(message, args);

    } catch (err) {
        log.error(`[/monitors/commands-monitor.js] ${err}`);
    }
};