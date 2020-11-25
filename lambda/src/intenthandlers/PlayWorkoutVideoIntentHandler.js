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
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const duration = sessionAttributes.Duration;
    const exerciseLevel = sessionAttributes.ExerciseLevel;
    // TODO: ExerciseType is a mandatory field and so assert on its presence.
    const exerciseType = sessionAttributes.ExerciseType;
    const muscleGroups = sessionAttributes.MuscleGroups;

    const playable = await videoIndex.getPlayableVideo(exerciseType, duration, muscleGroups, exerciseLevel);
    console.log(`Video selected: ${JSON.stringify(playable)}`);

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
