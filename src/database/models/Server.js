import { Model, BIGINT, STRING } from 'sequelize';
import { config }                from '../../conf/config';

let sequelize = config.db;

class Server extends Model {}

Server.init({
    guild: {
        type: BIGINT,
        unique: true,
        allowNull: false
    },
    appVersion: {
        type: STRING(20),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Server'
});

module.exports = Server;