import { readdirSync } from 'fs';
import { Sequelize }   from 'sequelize';
import { config }      from "../conf/config";
import log             from 'winston';

/**
 * Creates a database connection, routes SQL logs to our log files, and syncs our domain models to the database.
 *
 * @returns {Promise<void>}
 */
exports.loadDatabase = async () => {
    switch (process.env.NODE_ENV) {
        case 'development' || 'test':
            config.db = await new Sequelize(process.env.DATABASE_URL, {
                dialect: 'postgres',
                logging: (msg) => log.debug(msg)
            });
            break;

        case 'production':
            config.db = await new Sequelize(process.env.DATABASE_URL, {
                dialect: 'postgres',
                // Enable SSL and reject unauthorized database requests in production
                ssl: true,
                dialectOptions: {
                    ssl:
                        {
                            require: true,
                            rejectUnauthorized: false
                        }
                },
                logging: (msg) => log.debug(msg)
            });
            break;
    }

    // Retrieve the names of all the model files from the /models/ directory
    let modelFilenames = await readdirSync(__dirname + '/models');

    // Loop through each model file and add it to the database object
    for (let modelFilename of modelFilenames) {
        let modelFilePath = __dirname + '/models/' + modelFilename;
        let model = require(modelFilePath);
        config.db[model.name] = model;
    }

    // Sync the database with the database object containing our models
    await config.db.sync();
};
