import log from 'winston';

exports.buildMentionsArray = async (mentions) => {
    try {
        let mentionsArray = [];

        // Gather any mentions attached to the ready check initiation message
        for (let user of mentions.users.array()) {
            if (!mentionsArray.includes(user)) {
                mentionsArray.push(user);
            }
        }

        // Gather any roles attached to the ready check initiation message
        for (let role of mentions.roles.array()) {
            for (let member of role.members.array()) {
                if (!mentionsArray.includes(member.user)) {
                    mentionsArray.push(member.user);
                }
            }
        }

        return mentionsArray;

    } catch (err) {
        log.error(`[/utils/mentionsService.js] ${err}`);
    }
};