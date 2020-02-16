import { RichEmbed, Client } from 'discord.js';

/**
 * Sets the Discord client so it does not have to be passed to every embed template.
 * THIS IS REQUIRED TO USE TEMPLATES! SET THIS WHEN BOOTSTRAPPING THE APPLICATION!
 *
 * @param client the Discord client (the bot)
 * @returns {Promise<void>} an empty Promise
 */
exports.setClient = async (client) => {
    config.client = client;
};

const config = {
    client: new Client(),
    images: {
        authorIconUrl: 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png',
        errorThumbnailUrl: 'https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif',
        animatedIcsBotThumbnailUrl: 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif',
        readyCheckLobbyImageUrl: 'https://cdn.discordapp.com/attachments/160594618478493696/677024135326466048/ics.gif',
        cancelReadyCheckThumbnailUrl: 'https://cdn.discordapp.com/attachments/387026235458584597/390386951557218315/dottedClose.gif'
    }
};

exports.newClientReadyEmbed = () => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newCreateSmangleLoungeEmbed = () => {
    return new RichEmbed()
        .setTitle('Welcome to the Smangle Lounge')
        .setTimestamp()
        .setThumbnail(config.images.animatedIcsBotThumbnailUrl)
        .setDescription(`I will listen for \`${process.env.PREFIX}\` commands everywhere, but here is a dedicated place.\n\n**Everyone needs a place to smangle!**`)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newErrorEmbed = (errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(config.images.errorThumbnailUrl)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newCountdownEmbed = (image) => {
    return new RichEmbed()
        .setImage(image)
        .setTimestamp()
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newCountdownHistoryEmbed = (historyDescription) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(config.images.animatedIcsBotThumbnailUrl)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newReadyCheckLobbyEmbed = (readyUsers, unreadyUsers) => {
    return new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(config.images.readyCheckLobbyImageUrl)
        .addField("**Ready:**", `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`)
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", ") : "Everyone is ready!"}`)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newCancelReadyCheckEmbed = (description) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(description)
        .setThumbnail(config.images.cancelReadyCheckThumbnailUrl)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};