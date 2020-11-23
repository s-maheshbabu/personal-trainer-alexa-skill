const intentToCommandMap = {
    'AMAZON.PauseIntent': 'pause',
}

const getCommand = (intentName) => {
    return intentToCommandMap[intentName];
}

module.exports = {
    getCommand: getCommand,
};