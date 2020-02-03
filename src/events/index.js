import { readdir } from 'fs';
import log         from 'winston';

export async function loadEvents(client) {
    try {
        // Read the files in this directory
        await readdir(__dirname, (err, files) => {
            // Log a warning if an error occurred while reading the directory
            if (err) {
                log.warn(`Events were not loaded. Reason: '${err.message}'`);
                return client;
            }
            // Log a warning if the index.js file is the only one in the directory
            if (files.length === 1 && files[0] === 'index.js') {
                log.warn(`Events were not loaded. Reason: 'No events have been defined in the /events/ directory.'`);
                return client;
            }

            // Create a Discord event listener for each file in this directory
            files.forEach(file => {
                // Skip this file because it is not an event
                if (file === 'index.js') return;

                let eventFilename = require(`./${file}`);
                let eventName = file.split(".")[0];

                client.on(eventName, (...args) => eventFilename.run(client, ...args));
            });
        });

    } catch (error) {
        log.warn(`[/events/index.js] Events were not loaded. Reason: '${error}'`);
    }

    return client;
}
