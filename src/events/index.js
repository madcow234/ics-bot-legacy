import { readdirSync } from 'fs';
import log         from 'winston';

export async function loadEvents(client) {
    try {
        // Read the files in this directory
        let eventFiles = readdirSync(__dirname);

        // Log a warning if the directory is empty or the index.js file is the only one in the directory
        if (eventFiles.length === 0 || (eventFiles.length === 1 && eventFiles[0] === 'index.js')) {
            log.warn(`Events were not loaded. Reason: 'No events have been defined in the /events/ directory.'`);
            return client;
        }

        // Create a Discord event listener for each file in this directory
        eventFiles.forEach(file => {
            // Skip this file because it is not an event
            if (file === 'index.js') return;

            let eventFilename = require(`./${file}`);
            let eventName = file.split(".")[0];

            client.on(eventName, (...args) => eventFilename.run(client, ...args));
        });

        return client;

    } catch (error) {
        log.warn(`[/events/index.js] Events were not loaded. Reason: '${error}'`);
    }

}
