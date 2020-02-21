import { RichEmbed } from 'discord.js';
import { config }    from '../conf/config';

exports.newClientReadyEmbed = () => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
};

exports.newCreateSmangleLoungeEmbed = () => {
    return new RichEmbed()
        .setTitle('Welcome to the Smangle Lounge')
        .setTimestamp()
        .setThumbnail(config.embeds.images.animatedIcsBotThumbnailUrl)
        .setDescription(`I will listen for \`${process.env.PREFIX}\` commands everywhere, but here is a dedicated place.\n\n**Everyone needs a place to smangle!**`)
};

exports.newErrorEmbed = (errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(config.embeds.images.errorThumbnailUrl)
};

exports.newCountdownEmbed = (image) => {
    return new RichEmbed()
        .setImage(image)
        .setTimestamp()
};

exports.newCountdownHistoryEmbed = (historyDescription, thumbnailUrl) => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(thumbnailUrl)
};

exports.newReadyCheckLobbyEmbed = (initiatingUser, readyUsers, preparingUsers, unreadyUsers) => {
    let readyCheckLobbyEmbed = new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(config.embeds.images.readyCheckLobbyImageUrl);

    if (readyUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Ready:**", readyUsers.join(", "))
    }

    if (preparingUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Pangling:**", preparingUsers.join(", "))
    }

    if (unreadyUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Waiting For:**", unreadyUsers.join(", "))
    }

    return readyCheckLobbyEmbed;
};