const parse = require('iso8601-duration').parse;
const utilities = require("utilities");

module.exports = StartWorkoutAPI = {
    canHandle(handlerInput) {
        return utilities.isApiRequest(handlerInput, 'StartWorkoutAPI');
    },
    async handle(handlerInput) {
        const apiArguments = utilities.getApiArguments(handlerInput);
        const apiSlots = utilities.getSlots(handlerInput);

        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        if (apiSlots.Duration) {
            try {
                const parsedDuration = parse(utilities.getSlotValue(apiSlots.Duration));
                sessionAttributes.Duration = parsedDuration.minutes;
            } catch (error) {
                console.log(`WARN: Failed to parse the duration slot: ${apiSlots.Duration}. Ignoring the slot.`);
            }
        }
        if (apiSlots.ExerciseLevel) sessionAttributes.ExerciseLevel = utilities.getFirstResolvedEntityId(apiSlots.ExerciseLevel);
        // TODO: ExerciseType is a mandatory field and so assert on its presence.
        if (apiSlots.ExerciseType) sessionAttributes.ExerciseType = utilities.getFirstResolvedEntityId(apiSlots.ExerciseType);
        if (apiArguments.MuscleGroups) sessionAttributes.MuscleGroups = resolveEntities(apiArguments.MuscleGroups);

        console.log("Attr" + JSON.stringify(sessionAttributes))
        // Sticking the search filters in context just for testing purposes.
        const { context } = handlerInput;
        if (context) {
            if (sessionAttributes.Duration) context.Duration = sessionAttributes.Duration;
            if (sessionAttributes.ExerciseLevel) context.ExerciseLevel = apiArguments.ExerciseLevel;
            if (sessionAttributes.ExerciseType) context.ExerciseType = apiArguments.ExerciseType;
            if (sessionAttributes.MuscleGroups) context.MuscleGroups = apiArguments.MuscleGroups;
        }

        return {
            directives: [{
                type: 'Dialog.DelegateRequest',
                target: 'skill',
                period: {
                    until: 'EXPLICIT_RETURN'
                },
                updatedRequest: {
                    type: 'IntentRequest',
                    intent: {
                        name: 'PlayWorkoutVideoIntent',
                    }
                }
            }],
            apiResponse: {},
        }
    }
}

let synonymsToIdMap;
const slotnames = require("../constants/SlotNames").slotnames;
/**
 * Until Alexa Conversations can do entity resolution for list slots, this method is needed
 * to perform ER ourselves.
 */
function resolveEntities(raw_muscle_groups) {
    if (!Array.isArray(raw_muscle_groups)) return raw_muscle_groups;
    if (!synonymsToIdMap) synonymsToIdMap = utilities.slotSynonymsToIdMap(slotnames.MuscleGroup);

    const resolved_muscle_groups = new Set();

    raw_muscle_groups.forEach(muscle_group => {
        if (synonymsToIdMap.has(muscle_group)) resolved_muscle_groups.add(synonymsToIdMap.get(muscle_group));
    });

    return [...resolved_muscle_groups];
}