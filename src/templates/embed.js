import { RichEmbed } from 'discord.js';
import { config }    from '../conf/config';

exports.newClientReadyEmbed = () => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
        .setColor('GREEN')
};

exports.newCreateSmangleLoungeEmbed = () => {
    return new RichEmbed()
        .setTitle('Welcome to the Smangle Lounge')
        .setTimestamp()
        .setThumbnail(config.embeds.images.animatedIcsBotThumbnailUrl)
        .setDescription(`I will listen for \`${process.env.PREFIX}\` commands everywhere, but here is a dedicated place.\n\n**Everyone needs a place to smangle!**`)
        .setColor('GREEN')
};

exports.newErrorEmbed = (errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(config.embeds.images.errorThumbnailUrl)
        .setColor('RED')
};

exports.newCountdownEmbed = (image) => {
    return new RichEmbed()
        .setImage(image)
        .setTimestamp()
        .setColor('GREEN')
};

exports.newCountdownHistoryEmbed = (historyDescription, thumbnailUrl, color = 'GREEN') => {
    return new RichEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(thumbnailUrl)
        .setColor(color)
};

exports.newReadyCheckLobbyEmbed = (userStateMap) => {
    let readyCheckLobbyEmbed = new RichEmbed()
        .setTitle(`Ready Check Lobby`)
        .setTimestamp()
        .setImage(config.embeds.images.readyCheckLobbyImageUrl)
        .setColor('GREEN');

    let readyUsers = [];
    let preparingUsers = [];
    let inactiveUsers = [];

    for (let [user, state] of userStateMap) {
        if (state === config.enums.userStates.READY) {
            readyUsers.push(user);
        } else if (state === config.enums.userStates.PREPARING) {
            preparingUsers.push(user);
        } else if (state === config.enums.userStates.INACTIVE) {
            inactiveUsers.push(user);
        }
    }

    if (readyUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Ready:**", readyUsers.join(", "))
    }

    if (preparingUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Almost ready:**", preparingUsers.join(", "))
    }

    if (inactiveUsers.length > 0) {
        readyCheckLobbyEmbed.addField("**Needs to ready up:**", inactiveUsers.join(", "))
    }

    return readyCheckLobbyEmbed;
};