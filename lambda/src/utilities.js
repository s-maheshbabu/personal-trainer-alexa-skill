const Alexa = require('ask-sdk-core');
const { hasIn } = require('immutable');
const EmailValidator = require("email-validator");

const skill_model = require("../model/en-US");

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

/**
 * Checks for permissions to access the user's email address and returns
 * a valid email address is available. Returns null otherwise.
 */
async function getEmailAddress(handlerInput) {
    const { requestEnvelope, serviceClientFactory } = handlerInput;

    let emailAddress = null;
    const consentToken = requestEnvelope.context.System.apiAccessToken;
    if (!consentToken) {
        console.log(`User hasn't granted permissions to access their profile information.`);
        return emailAddress;
    }

    try {
        const client = serviceClientFactory.getUpsServiceClient();
        emailAddress = await client.getProfileEmail();
    } catch (error) {
        if (error.statusCode === 403)
            console.log(`User hasn't granted permissions to access their profile information. Error: ${error}`);
        else
            console.log(`An unexpected error occurred while trying to fetch user profile: ${error}`);
    }

    if (!EmailValidator.validate(emailAddress)) return null;
    return emailAddress;
}

const getFirstResolvedEntityId = (element) => {
    if (!hasIn(element, ['resolutions'])) return null;

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
 * Helper method to obtain the simple slot value from a given slot.
 */
const getSlotValue = (slot) => {
    return Alexa.getSimpleSlotValues(slot)
        .map(
            (slotValue) => `${slotValue.value}`
        )
        .join(' ');
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
                synonymsToIdMap.set(element.name.value, id);

                const synonyms = element.name.synonyms;
                if (Array.isArray(synonyms)) synonyms.forEach(synonym => synonymsToIdMap.set(synonym, id));
            });
        }
    }
    return synonymsToIdMap;
};

module.exports = {
    getApiArguments: getApiArguments,
    getEmailAddress: getEmailAddress,
    getFirstResolvedEntityId: getFirstResolvedEntityId,
    getIntentName: getIntentName,
    getSlots: getSlots,
    getSlotValue: getSlotValue,
    isApiRequest: isApiRequest,
    isIntent: isIntent,
    slotSynonymsToIdMap: slotSynonymsToIdMap,
};