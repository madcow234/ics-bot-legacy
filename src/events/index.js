import { readdirSync } from 'fs';
import { config }      from '../conf/config';
import log             from 'winston';

/**
 * Reads the events directory and creates an event listener for each of the files.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.loadEvents = async () => {
    try {
        // Read the files in this directory
        let eventFiles = await readdirSync(__dirname);

        // Log a warning if the directory is empty or the index.js file is the only one in the directory
        if (eventFiles.length === 0 || (eventFiles.length === 1 && eventFiles[0] === 'index.js')) {
            log.warn(`Events were not loaded. Reason: 'No events have been defined in the /events/ directory.'`);
            return;
        }

        // Create a Discord event listener for each file in this directory
        for (let file of eventFiles) {
            // Skip this file because it is not an event
            if (file === 'index.js') continue;

            let eventFilename = require(`./${file}`);
            let eventName = file.split(".")[0];

            // Creates the event listener as an async function that awaits the return of the run function in each event file
            config.client.on(eventName, async (...args) => await eventFilename.run(...args));
        }

    } catch (err) {
        log.error(`[/events/index.js] Events were not loaded. Reason: '${err}'`);
    }
};
