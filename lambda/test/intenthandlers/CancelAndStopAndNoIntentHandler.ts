import * as deepEqual from 'deep-equal';

import { AlexaTest, IntentRequestBuilder, SkillSettings } from 'ask-sdk-test';
const skillSettings: SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

import { handler as skillHandler } from "../../src/index";
const alexaTest = new AlexaTest(skillHandler, skillSettings);

const exitSkillDocument = require("../../src/response/display/ExitSkillView/document.json");

describe("Exiting the skill", () => {
    describe('should exit the skill when the user says stop or cancel', () => {
        const exitIntents = ['AMAZON.CancelIntent', 'AMAZON.StopIntent'];
        exitIntents.forEach(intentName => {
            alexaTest.test([
                {
                    request: new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build(),
                    says: `Goodbye!`,
                    shouldEndSession: true,
                    get renderDocument() {
                        return {
                            document: (doc: any) => {
                                return deepEqual(doc, exitSkillDocument);
                            }
                        }
                    },
                },
            ]);
        });
    });
});
