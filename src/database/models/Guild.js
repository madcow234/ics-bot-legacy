import { Model, BIGINT, STRING } from 'sequelize';
import { config }                from '../../conf/config';

let sequelize = config.db;

class Guild extends Model {}

Guild.init({
    guildId: {
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
    modelName: 'Guild'
});

module.exports = Guild;