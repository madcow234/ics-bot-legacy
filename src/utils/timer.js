/**
 * Promise based sleep command.
 * Ex. await sleep(1000);
 *
 * @param milliseconds length of the sleep
 * @returns {Promise<>} an empty Promise
 */
exports.sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};