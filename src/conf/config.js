import { Client } from "discord.js";

/**
 * A global config object for the application.
 */
exports.config = {
    client: new Client(),
    embeds: {
        images: {
            authorIconUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682402957219725332/icsbot_static.png',
            animatedIcsBotThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682402969274023967/icsbot_animated.gif',
            errorThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682402598724436032/general_error.gif',
            readyCheckLobbyImageUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682403303245742120/flashing_alert_ics.gif',
            initiateReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682405146797277214/initiate_ready_check.gif',
            restartReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682401952595705891/restart_ready_check.gif',
            emergencyOverrideReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/686014499391799313/emergency-override-ready-check.gif',
            cancelReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682402341349228574/cancel_ready_check.gif',
            noParticipantsReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/673213456526082053/682406964205977648/no_participants_ready_check.gif'
        }
    },
    enums: {
        userStates: {
            INACTIVE: 'INACTIVE',
            PREPARING: 'PREPARING',
            READY: 'READY'
        }
    },
    crew: ['160457026793766912', '160141834931142657', '351877350004228097']
};
