import { RichEmbed } from 'discord.js';

exports.newClientReadyEmbed = (client) => {
    return new RichEmbed()
        .setTitle(`It's smangling time!`)
        .setTimestamp()
        .setDescription(`Never fear...**${client.user.username}** is here!`)
        .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif');
};

exports.newErrorEmbed = (client, errorDescription) => {
    return new RichEmbed()
        .setTitle(`Error Report`)
        .setTimestamp()
        .setDescription(errorDescription)
        .setThumbnail("https://cdn.discordapp.com/attachments/387026235458584597/390386949631901706/flickerError.gif")
        .setAuthor(client.user.username, 'https://cdn.discordapp.com/attachments/160821484770557953/673758923446157322/icsbotanimated.gif');
};
