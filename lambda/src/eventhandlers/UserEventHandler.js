const eventtypes = require("constants/EventTypes").eventtypes;

const endOfWorkoutDocument = require("response/display/EndOfWorkoutView/document.json");
const endOfWorkoutDataSource = require("response/display/EndOfWorkoutView/datasources/default");

const exitSkillDocument = require("response/display/ExitSkillView/document.json");

const { APL_DOCUMENT_TYPE, APL_DOCUMENT_VERSION } = require("constants/APL");

module.exports = UserEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
    },
    handle(handlerInput) {
        const { responseBuilder } = handlerInput;

        const eventType = handlerInput.requestEnvelope.request.arguments[0];
        const channelName = handlerInput.requestEnvelope.request.arguments[1];
        const originalUrl = handlerInput.requestEnvelope.request.arguments[2];
        const videoImageUrl = handlerInput.requestEnvelope.request.arguments[3];

        if (eventtypes.WorkoutEnded === eventType)
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
        else if (eventtypes.SendEmail === eventType)
            // TODO: Actually send an email here.
            return responseBuilder
                .speak(`Done. See you on your next workout. Good bye.`)
                .addDirective({
                    type: APL_DOCUMENT_TYPE,
                    version: APL_DOCUMENT_VERSION,
                    document: exitSkillDocument,
                })
                .withShouldEndSession(undefined)
                .getResponse();
        // TODO: throw error for unexpected event.
    }
}