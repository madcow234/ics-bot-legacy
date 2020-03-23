import { MessageEmbed } from 'discord.js';
import { changelist }   from '../conf/patch-notes';
import { config }       from '../conf/config';

exports.newClientUpgradeEmbed = (oldAppVersion, newAppVersion) => {

    return new MessageEmbed()
        .setTitle(`Yay! You've received an update!`)
        .setTimestamp()
        .addField(`**Previous Version**`, oldAppVersion)
        .addField(`**Current Version**`, newAppVersion)
        .addField(`**New Features**`, changelist[newAppVersion].newFeatures)
        .addField(`**Bug Fixes**`, changelist[newAppVersion].bugFixes)
        .addField(`**Known Issues**`, changelist[newAppVersion].knownIssues)
        .setColor('GREEN')
};

exports.newCreateSmangleLoungeEmbed = () => {
    return new MessageEmbed()
        .setTitle('Welcome to the Smangle Lounge')
        .setTimestamp()
        .setThumbnail(config.embeds.images.animatedIcsBotThumbnailUrl)
        .setDescription(`I will listen for \`${process.env.PREFIX}\` commands everywhere, but here is a dedicated place.\n\n**Everyone needs a place to smangle!**`)
        .setColor('GREEN')
};

exports.newErrorEmbed = (errorDescription) => {
    return new MessageEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail(config.embeds.images.errorThumbnailUrl)
        .setColor('RED')
};

exports.newCountdownEmbed = (image) => {
    return new MessageEmbed()
        .setImage(image)
        .setTimestamp()
        .setColor('GREEN')
};

exports.newCountdownHistoryEmbed = (historyDescription, thumbnailUrl, color = 'GREEN') => {
    return new MessageEmbed()
        .setTitle(`ICS History Report`)
        .setTimestamp()
        .setDescription(historyDescription)
        .setThumbnail(thumbnailUrl)
        .setColor(color)
};

exports.newReadyCheckLobbyEmbed = (userStateMap) => {
    let readyCheckLobbyEmbed = new MessageEmbed()
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
