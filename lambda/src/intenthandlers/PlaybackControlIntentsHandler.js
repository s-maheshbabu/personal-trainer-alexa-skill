const utilities = require("utilities");
const getCommands = require("constants/PlaybackControlCommands").getCommands;

const { APL_COMMANDS_TYPE, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

module.exports = PlaybackControlIntentsHandler = {
  canHandle(handlerInput) {
    return utilities.isIntent(handlerInput, 'AMAZON.PauseIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.ResumeIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.NextIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.PreviousIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.StartOverIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.RepeatIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.LoopOnIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.LoopOffIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.ShuffleOffIntent') ||
      utilities.isIntent(handlerInput, 'AMAZON.ShuffleOnIntent');
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const intentName = utilities.getIntentName(handlerInput);

    const commands = getCommands(intentName);
    if (!Array.isArray(commands) || !commands.length) {
      return responseBuilder
        .speak(`I am sorry but I currently do not support that.`)
        .getResponse();
    }

    return responseBuilder
      .addDirective(buildPlaybackControlsDirective(getCommands(intentName)))
      .getResponse();
  }
};

function buildPlaybackControlsDirective(commands) {
  return {
    type: APL_COMMANDS_TYPE,
    token: VIDEO_PLAYER_VIEW_TOKEN,
    commands: [
      {
        type: "Sequential",
        commands: buildPlaybackControlsCommands(commands),
      }
    ]
  };
}

function buildPlaybackControlsCommands(commands) {
  const commandObjects = [];
  commands.forEach(command => commandObjects.push({
    type: "ControlMedia",
    componentId: VIDEO_PLAYER_COMPONENT_ID,
    command: command,
  }));

  return commandObjects;
}
