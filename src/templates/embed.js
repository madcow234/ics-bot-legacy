import { RichEmbed, Client } from 'discord.js';

const authorIconUrl = 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png';
const errorThumbnailUrl = 'https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif';
const countdownHistoryThumbnailUrl = 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif';
const readyCheckLobbyImageUrl = 'https://cdn.discordapp.com/attachments/160594618478493696/677024135326466048/ics.gif';
const cancelReadyCheckThumbnailUrl = 'https://cdn.discordapp.com/attachments/387026235458584597/390386951557218315/dottedClose.gif';

let CLIENT = new Client();

/**
 * Sets the Discord client so it does not have to be passed to every embed template.
 * THIS IS REQUIRED TO USE TEMPLATES! SET THIS WHEN BOOTSTRAPPING THE APPLICATION!
 *
 * @type {module:"discord.js".Client} a populated Discord {@link Client}
 */
exports.setClient = async (client) => {
    CLIENT = client;
};

exports.newClientReadyEmbed = () => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
        .setAuthor(CLIENT.user.username, authorIconUrl);
};

exports.newErrorEmbed = (errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(errorThumbnailUrl)
        .setAuthor(CLIENT.user.username, authorIconUrl);
};

exports.newCountdownEmbed = (image) => {
    return new RichEmbed()
        .setImage(image)
        .setTimestamp()
        .setAuthor(CLIENT.user.username, authorIconUrl);
};

exports.newCountdownHistoryEmbed = (historyDescription) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(countdownHistoryThumbnailUrl)
        .setAuthor(CLIENT.user.username, authorIconUrl);
};

exports.newReadyCheckLobbyEmbed = (readyUsers, unreadyUsers) => {
    return new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(readyCheckLobbyImageUrl)
        .addField("**Ready:**", `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`)
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", ") : "Everyone is ready!"}`)
        .setAuthor(CLIENT.user.username, authorIconUrl);
};

exports.newCancelReadyCheckEmbed = (description) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(description)
        .setThumbnail(cancelReadyCheckThumbnailUrl)
        .setAuthor(CLIENT.user.username, authorIconUrl);
};