import { RichEmbed } from 'discord.js';

exports.newClientReadyEmbed = (client) => {
    return new RichEmbed()
        .setTitle(`It's smangling time!`)
        .setTimestamp()
        .setDescription(`Never fear...**${client.user.username}** is here!`)
        .setAuthor(client.user.username);
};