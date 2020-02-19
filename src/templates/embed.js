import { RichEmbed } from 'discord.js';
import { config }    from '../conf/config';

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
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", ") : "It's almost time!"}`)
        .setAuthor(config.client.user.username, config.images.authorIconUrl);
};

exports.newReadyCheckLobbyWithPreparingEmbed = (readyUsers, preparingUsers, unreadyUsers) => {
    return new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(config.images.readyCheckLobbyImageUrl)
        .addField("**Ready:**", `${readyUsers.length > 0 ? readyUsers.join(", ") : "Waiting..."}`)
        .addField("**Pangling:**", `${preparingUsers.length > 0 ? preparingUsers.join(", ") : "..."}`)
        .addField("**Waiting For:**", `${unreadyUsers.length > 0 ? unreadyUsers.join(", ") : "It's almost time!"}`)
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