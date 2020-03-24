/**
 * An object to hold a running list of patch notes.
 */
exports.changelist = {
    '0.0.2': {
        newFeatures: [
            '**This!**',
                '- You will now receive patch notes to this channel each time the bot is updated.',
            '\n**Added new command:** `delay`',
                '- Initiates a countdown after the desired delay.',
                `- Ex. \`${process.env.PREFIX} delay 2\` will start a countdown in 2 minutes.`,
                '- Note: Delay is limited to 20 minutes.',
            '\n**Added initial persistence framework**',
                '- More to come later!'
        ],
        bugFixes: [
            'Various code optimizations'
        ],
        knownIssues: [
            'No known issues'
        ]
    },
    '0.0.1': {
        newFeatures: [
            'Initial release'
        ],
        bugFixes: [
            'Initial release'
        ],
        knownIssues: [
            'Initial release'
        ]
    }
};
