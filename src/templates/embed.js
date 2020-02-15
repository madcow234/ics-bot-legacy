import { RichEmbed } from 'discord.js';

const iconUrl = 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png';
const errorThumbnailUrl = 'https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif';
const countdownHistoryThumbnailUrl = 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif';
const readyCheckLobbyImageUrl = 'https://cdn.discordapp.com/attachments/160594618478493696/677024135326466048/ics.gif';
const cancelReadyCheckThumbnailUrl = 'https://cdn.discordapp.com/attachments/387026235458584597/390386951557218315/dottedClose.gif';

exports.ClientReadyEmbed = (client) => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
        .setAuthor(client.user.username, iconUrl);
};

exports.ErrorEmbed = (client, errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(errorThumbnailUrl)
        .setAuthor(client.user.username, iconUrl);
};

exports.CountdownEmbed = (client, image) => {
    return new RichEmbed()
        .setImage(image)
        .setTimestamp()
        .setAuthor(client.user.username, iconUrl);
};

exports.CountdownHistoryEmbed = (client, historyDescription) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(countdownHistoryThumbnailUrl)
        .setAuthor(client.user.username, iconUrl);
};

exports.ReadyCheckLobbyEmbed = (client, readyUsers, unreadyUsers) => {
    return new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(readyCheckLobbyImageUrl)
        .addField("**Ready:**", `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`)
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", ") : "Everyone is ready!"}`)
        .setAuthor(client.user.username, iconUrl);
};

exports.CancelReadyCheckEmbed = (client, description) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(description)
        .setThumbnail(cancelReadyCheckThumbnailUrl)
        .setAuthor(client.user.username, iconUrl);
};