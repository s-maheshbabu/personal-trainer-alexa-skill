const endOfWorkoutDocument = require("response/display/EndOfWorkoutView/document.json");
const endOfWorkoutDataSource = require("response/display/EndOfWorkoutView/datasources/default");

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION } = require("constants/APL");

module.exports = UserEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
    },
    handle(handlerInput) {
        const { responseBuilder } = handlerInput;

        const channelName = handlerInput.requestEnvelope.request.arguments[0];
        const originalUrl = handlerInput.requestEnvelope.request.arguments[1];
        const videoImageUrl = handlerInput.requestEnvelope.request.arguments[2];

        return responseBuilder
            .speak(`Hope you had a great workout. You can show your appreciation for ${channelName} by liking and subscribing to their content. See you soon for your next workout.`)
            .addDirective({
                type: APL_DOCUMENT_TYPE,
                version: APL_DOCUMENT_VERSION,
                document: endOfWorkoutDocument,
                datasources: {
                    endOfWorkoutDataSource: endOfWorkoutDataSource(channelName, originalUrl, videoImageUrl)
                },
            })
            .withShouldEndSession(undefined)
            .getResponse();
    }
}