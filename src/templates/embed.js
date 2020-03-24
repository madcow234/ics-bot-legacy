import { MessageEmbed } from 'discord.js';
import { changelist }   from '../conf/patch-notes';
import { config }       from '../conf/config';

exports.newClientUpgradeEmbed = (oldAppVersion, newAppVersion) => {
    return new MessageEmbed()
        .setTitle('Yay! You\'ve received an update!')
        .addField('**Current Version**', `**${newAppVersion}**`)
        .addField('Previous Version', oldAppVersion)
        .addField('**New Features**', changelist[newAppVersion].newFeatures)
        .addField('**Bug Fixes**', changelist[newAppVersion].bugFixes)
        .addField('Known Issues', changelist[newAppVersion].knownIssues)
        .setColor('GREEN')
        .setTimestamp()
};

exports.newCreateSmangleLoungeEmbed = () => {
    return new MessageEmbed()
        .setTitle('Welcome to the Smangle Lounge')
        .setThumbnail(config.embeds.images.animatedIcsBotThumbnailUrl)
        .setDescription(`I will listen for \`${process.env.PREFIX}\` commands everywhere, but here is a dedicated place.\n\n**Everyone needs a place to smangle!**`)
        .setColor('GREEN')
        .setTimestamp()
};

exports.newErrorEmbed = (errorDescription) => {
    return new MessageEmbed()
        .setTitle('Error Report')
        .setDescription(errorDescription)
        .setThumbnail(config.embeds.images.errorThumbnailUrl)
        .setColor('RED')
        .setTimestamp()
};

exports.newCountdownEmbed = (image) => {
    return new MessageEmbed()
        .setImage(image)
        .setColor('GREEN')
        .setTimestamp()
};

exports.newCountdownHistoryEmbed = (historyDescription, thumbnailUrl, color = 'GREEN') => {
    return new MessageEmbed()
        .setTitle('ICS History Report')
        .setDescription(historyDescription)
        .setThumbnail(thumbnailUrl)
        .setColor(color)
        .setTimestamp()
};

exports.newReadyCheckLobbyEmbed = (userStateMap) => {
    let readyCheckLobbyEmbed = new MessageEmbed()
        .setTitle('Ready Check Lobby')
        .setImage(config.embeds.images.readyCheckLobbyImageUrl)
        .setColor('GREEN')
        .setTimestamp();

    let readyUsers = [];
    let preparingUsers = [];
    let inactiveUsers = [];

    for (let [user, state] of userStateMap) {
        switch (state) {
            case config.enums.userStates.READY:
                readyUsers.push(user);
                break;
            case config.enums.userStates.PREPARING:
                preparingUsers.push(user);
                break;
            case config.enums.userStates.INACTIVE:
                inactiveUsers.push(user);
                break;
        }
    }

    if (readyUsers.length > 0) {
        readyCheckLobbyEmbed.addField('**Ready:**', readyUsers.join(', '))
    }

    if (preparingUsers.length > 0) {
        readyCheckLobbyEmbed.addField('**Almost ready:**', preparingUsers.join(', '))
    }

    if (inactiveUsers.length > 0) {
        readyCheckLobbyEmbed.addField('**Needs to ready up:**', inactiveUsers.join(', '))
    }

    return readyCheckLobbyEmbed;
};

exports.newDelayedCountdownLobbyEmbed = (initiatingUser, attentionUsers, attendingUsers) => {
    return new MessageEmbed()
        .setTitle('Upcoming Countdown')
        .setDescription(`${attentionUsers.length > 0 ? `Attention: ${attentionUsers.join(', ')}\n\n` : ``} Click OK to confirm attendance.`)
        .addField('**Attending:**', attendingUsers.size === 0 ? 'No attendees yet' : `${Array.from(attendingUsers.keys()).join(', ')}`)
        .setColor('GREEN')
        .setTimestamp()
};

exports.newDelayedCountdownTimerEmbed = (time) => {
    return new MessageEmbed()
        .setTitle('Time Remaining')
        .setDescription(`**${time}**`)
        .setColor('GREEN')
        .setTimestamp()
};