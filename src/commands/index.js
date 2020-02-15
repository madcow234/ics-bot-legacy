import { readdirSync } from 'fs';
import log             from 'winston';

exports.getCommands = async () => {
    try {
        let commandsArray = [];

        // Read the files in this directory
        let commandFiles = await readdirSync(__dirname);

        // Log a warning if the directory is empty or the index.js file is the only one in the directory
        if (commandFiles.length === 0 || (commandFiles.length === 1 && commandFiles[0] === 'index.js')) {
            log.warn(`Could not retrieve commands. Reason: 'No commands have been defined in the /commands/ directory.'`);
            return commandsArray;
        }

        // Create a Discord event listener for each file in this directory
        for (let file of commandFiles) {
            // Skip this file because it is not an event
            if (file === 'index.js') return;

            let commandName = file.split(".")[0];
            commandsArray.push(commandName);
        }

        return commandsArray;

    } catch (err) {
        log.error(`[/commands/index.js] Could not retrieve commands. Reason: '${err}'`);
    }
};
