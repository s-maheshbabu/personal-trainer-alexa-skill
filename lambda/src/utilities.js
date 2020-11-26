const Alexa = require('ask-sdk-core');
const skill_model = require("../../skill-package/interactionModels/custom/en-US");

/**
 * Helper method to get API arguments from the request envelope.
 */
const getApiArguments = (handlerInput) => {
    try {
        return handlerInput.requestEnvelope.request.apiRequest.arguments;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

const getFirstResolvedEntityId = (element) => {
    const [firstResolution = {}] = element.resolutions.resolutionsPerAuthority || [];
    return firstResolution && firstResolution.status.code === 'ER_SUCCESS_MATCH'
        ? firstResolution.values[0].value.id
        : null;
};

/**
 * Helper method to fetch the name of the intent. Will throw an error if the given
 * request object is not an IntentRequest.
 */
const getIntentName = (handlerInput) => {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest')
        throw Error(`The given object is not an intent request and so an intent name cannot be determined. Input: ${handlerInput}`);

    return handlerInput.requestEnvelope.request.intent.name;
}

/**
 * Helper method to get API slots from the request envelope.
 */
const getSlots = (handlerInput) => {
    try {
        return handlerInput.requestEnvelope.request.apiRequest.slots;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

/**
 * Helper method to find if a request is for a certain apiName.
 */
const isApiRequest = (handlerInput, apiName) => {
    try {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Dialog.API.Invoked'
            && handlerInput.requestEnvelope.request.apiRequest.name === apiName;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

/**
 * Helper method to find if a request is an IntentRequest of the specified intent.
 */
const isIntent = (handlerInput, intentName) => {
    try {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === intentName;
    } catch (e) {
        console.log('Error occurred: ', e);
        return false;
    }
}

const slotSynonymsToIdMap = (slotTypeName) => {
    if (!hasIn(skill_model, ['interactionModel', 'languageModel', 'types'])) throw new ReferenceError("Unexpected skill model. Unable to find path to slots.");

    const slotTypes = skill_model.interactionModel.languageModel.types;
    if (!Array.isArray(slotTypes) || slotTypes.length == 0) return new Map();

    let synonymsToIdMap = new Map();
    for (var i = 0; i < slotTypes.length; i++) {
        if (slotTypes[i].name === slotTypeName) {

            const slotValues = slotTypes[i].values;
            slotValues.forEach(element => {
                const id = element.id;
                const synonyms = element.name.synonyms;
                synonyms.forEach(synonym => synonymsToIdMap.set(synonym, id));
            });
        }
    }

    return synonymsToIdMap;
};

module.exports = {
    getApiArguments: getApiArguments,
    getFirstResolvedEntityId: getFirstResolvedEntityId,
    getIntentName: getIntentName,
    getSlots: getSlots,
    isApiRequest: isApiRequest,
    isIntent: isIntent,
    slotSynonymsToIdMap: slotSynonymsToIdMap,
};