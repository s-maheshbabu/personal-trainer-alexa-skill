const Alexa = require('ask-sdk-core');

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

const videoIndex = require('data/VideoIndex');

const doc = require("response/display/WorkoutVideoView/document.json");
const workoutVideoDataSource = require("response/display/WorkoutVideoView/datasources/default");

module.exports = PlayWorkoutVideoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayWorkoutVideoIntent';
  },
  async handle(handlerInput) {

    const playable = await videoIndex.getPlayableVideo();
    console.log(`Video selected: ${playable}`);

    const speakOutput = `Here is ${playable.title} from ${playable.channelName}. Enjoy your workout.`;
    const aplDirective = {
      type: APL_DOCUMENT_TYPE,
      token: VIDEO_PLAYER_VIEW_TOKEN,
      version: APL_DOCUMENT_VERSION,
      document: doc,
      datasources: {
        workoutVideoDataSource: workoutVideoDataSource(playable.url, VIDEO_PLAYER_COMPONENT_ID)
      },
    };

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(aplDirective)
      .getResponse();
  }
};
