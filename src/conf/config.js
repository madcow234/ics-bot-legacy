import { Client } from "discord.js";

/**
 * A global config object for the application.
 */
exports.config = {
    client: new Client(),
    embeds: {
        images: {
            authorIconUrl: 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png',
            errorThumbnailUrl: 'https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif',
            animatedIcsBotThumbnailUrl: 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif',
            readyCheckLobbyImageUrl: 'https://cdn.discordapp.com/attachments/160594618478493696/677024135326466048/ics.gif',
            cancelReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/160594618478493696/679521139214647350/cancelled.gif'
        }
    }
};