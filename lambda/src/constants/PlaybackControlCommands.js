const intentToCommandMap = {
    'AMAZON.PauseIntent': ['pause'],
    'AMAZON.ResumeIntent': ['play'],
    'AMAZON.NextIntent': ['next'],
    'AMAZON.PreviousIntent': ['previous'],
    'AMAZON.StartOverIntent': ['rewind', 'play'],
}

/**
 * Return an array of commands to be executed in response to an event. If no commands
 * are available, the return value could be undefined or an empty array.
 * @param {*} intentName The intent to obtaint he corresponding playback commands for.
 */
const getCommands = (intentName) => {
    const commands = intentToCommandMap[intentName];
    if (Array.isArray(commands) && commands.length == 0) {
        console.log(`An empty array of commands is an unexpected state. Input: ${intentName}`)
    }
    return commands;
}

module.exports = {
    getCommands: getCommands,
};