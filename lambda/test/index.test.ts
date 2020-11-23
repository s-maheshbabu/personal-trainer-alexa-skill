import { AlexaTest, LaunchRequestBuilder, SkillSettings } from 'ask-sdk-test';
const skillSettings: SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

import { handler as skillHandler } from "../src/index";
const alexaTest = new AlexaTest(skillHandler, skillSettings);

describe("Skill Luanch", () => {
    describe('should be able to launch the skill and render a welcome message.', () => {
        alexaTest.test([
            {
                request: new LaunchRequestBuilder(skillSettings).build(),
                says: `Welcome, to personal trainer. This is a placeholder?`,
                reprompts: `Welcome, to personal trainer. This is a placeholder?`,
                shouldEndSession: false,
            },
        ]);
    });

});
