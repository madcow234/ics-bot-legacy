import { newErrorEmbed } from '../templates/embed.js'
import log from 'winston';
import { readdirSync } from 'fs';

exports.run = async(client, message, args) => {
    try {
        if (args.length === 0) {
            return message.channel.send(newErrorEmbed(client, `Hi ${message.author.username}! I'm doing well, but I can't help you if you don't issue a command.`))
        }

        // Read the /commands/ folder and create a list of available commands to verify user-issued commands against
        // This is very important because the required commandFile below relies on user input to call a file, which can be very dangerous
        // We need to ensure that ONLY commands already available in the /commands/ folder actually load a file
        let files = readdirSync('src/commands');

        // Log a warning if there are no files in the directory
        if (files.length === 0) {
            log.warn(`Commands were not loaded. Reason: 'No commands have been defined in the /commands/ directory.'`);
            return message.channel.send(newErrorEmbed(client, `I'm so confused...I can't remember any commands right now.`));
        }

        // Add each file name (after stripping the .js extension) to a list of available commands
        let availableCommands = [];
        files.forEach(file => {
            availableCommands.push(file.split(".")[0].toLowerCase());
        });

        // Exit if no commands have been defined
        if (availableCommands.length === 0) return;

        // Exit and notify the user if they attempted to issue a command that is not available in the /commands/ folder
        if (availableCommands.indexOf(args[0]) === -1) {
            return message.channel.send(newErrorEmbed(client, `I'm sorry, '${args[0]}' is not a valid command.`));
        }

        // Execute the proper command file
        let commandFile = require(`../commands/${args[0]}.js`);
        return commandFile.run(client, message, args);

    } catch (err) {
        log.error(`[/monitors/commands.js] ${err.message}`);
    }
};