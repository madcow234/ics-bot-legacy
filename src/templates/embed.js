import { RichEmbed } from 'discord.js';

exports.newClientReadyEmbed = (client) => {
    return new RichEmbed()
        .setTimestamp()
        .setDescription(`Grab your bangle and get ready to smangle!`)
        .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');
};

exports.newErrorEmbed = (client, errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail("https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif")
        .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160594618478493696/673758112225820672/icsbot1.png');
};
