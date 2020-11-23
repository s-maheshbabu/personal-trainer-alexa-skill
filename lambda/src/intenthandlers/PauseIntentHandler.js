const utilities = require("utilities");
const getCommand = require("constants/PlaybackControlCommands").getCommand;

const { APL_COMMANDS_TYPE, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

module.exports = PauseIntentHandler = {
  canHandle(handlerInput) {
    return utilities.isIntent(handlerInput, 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    const intentName = utilities.getIntentName(handlerInput);
    return handlerInput.responseBuilder
      .addDirective({
        type: APL_COMMANDS_TYPE,
        token: VIDEO_PLAYER_VIEW_TOKEN,
        commands: [
          {
            type: "Sequential",
            commands: [
              buildControlMediaCommand(getCommand(intentName), VIDEO_PLAYER_COMPONENT_ID)
            ]
          }
        ]
      })
      .getResponse();
  }
};

function buildControlMediaCommand(command, videoPlayerId) {
  return {
    type: "ControlMedia",
    componentId: videoPlayerId,
    command: command
  }
}
