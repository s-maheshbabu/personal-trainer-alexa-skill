/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
require("app-module-path").addPath(__dirname);
const Alexa = require('ask-sdk-core');

const StartWorkoutAPI = require("api/StartWorkoutAPI");

const LaunchRequestHandler = require("requesthandlers/LaunchRequestHandler");
const SessionEndedRequestHandler = require("requesthandlers/SessionEndedRequestHandler");

const CancelAndStopIntentHandler = require("intenthandlers/CancelAndStopIntentHandler");
const FallbackIntentHandler = require("intenthandlers/FallbackIntentHandler");
const HelpIntentHandler = require("intenthandlers/HelpIntentHandler");
const PlaybackControlIntentsHandler = require("intenthandlers/PlaybackControlIntentsHandler");
const PlayWorkoutVideoIntentHandler = require("intenthandlers/PlayWorkoutVideoIntentHandler");

const ErrorHandler = require("errors/ErrorHandler");

const ResponseSanitizationInterceptor = require("interceptors/ResponseSanitizationInterceptor");

const TOTAL_REQUEST_TIME = `Total Request Time`;

// ***************************************************************************************************
// These simple interceptors just log the incoming and outgoing request bodies to assist in debugging.

const LogRequestInterceptor = {
    process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
        console.time(TOTAL_REQUEST_TIME);
    },
};

const LogResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`RESPONSE = ${JSON.stringify(response)}`);
        console.timeEnd(TOTAL_REQUEST_TIME);
    },
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CancelAndStopIntentHandler,
        HelpIntentHandler,
        LaunchRequestHandler,
        PlaybackControlIntentsHandler,
        PlayWorkoutVideoIntentHandler,

        StartWorkoutAPI,

        SessionEndedRequestHandler,
        FallbackIntentHandler,
        IntentReflectorHandler,
    )
    .addRequestInterceptors(
        LogRequestInterceptor,
    )
    .addResponseInterceptors(
        ResponseSanitizationInterceptor,
        LogResponseInterceptor,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .withCustomUserAgent('sample/personal-trainer/v1.2')
    .lambda();