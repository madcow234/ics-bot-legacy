import { newErrorEmbed } from '../templates/embed.js'
import { getCommands }   from '../commands'
import log               from 'winston';

exports.run = async(client, message, args) => {
    try {
        // If the command does not contain any arguments, send an error message and return
        if (args.length === 0) {
            return await message.channel.send(newErrorEmbed(`Hi ${message.author.username}! I'm doing well, but I can't help you if you don't issue a command.`))
        }

        // Read the /commands/ folder and create a list of available commands to verify user-issued commands against
        // This is very important because the required commandFile below relies on user input to call a file, which can be very dangerous
        // We need to ensure that ONLY commands already available in the /commands/ folder actually load a file
        let availableCommands = await getCommands();

        // Log a warning if there are no files in the directory
        if (availableCommands.length === 0) {
            return await message.channel.send(newErrorEmbed(`I'm so confused...I can't remember any commands right now.`));
        }

        // Exit and notify the user if they attempted to issue a command that is not available in the /commands/ folder
        if (availableCommands.lastIndexOf(args[0]) === -1) {
            return await message.channel.send(newErrorEmbed(`I'm sorry, '${args[0]}' is not a valid command.`));
        }

        // Execute the proper command file
        let commandFile = require(`../commands/${args[0]}.js`);
        return await commandFile.run(client, message, args);

    } catch (err) {
        log.error(`[/monitors/commands-monitor.js] ${err.message}`);
    }
};