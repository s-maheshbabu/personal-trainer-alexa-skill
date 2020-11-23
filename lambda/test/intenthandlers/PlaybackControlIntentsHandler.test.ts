const assert = require("chai").assert;

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

const { APL_COMMANDS_TYPE, VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("constants/APL");

describe("Playback Controls", () => {
    describe('should be able to pause a video', () => {
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, 'AMAZON.PauseIntent').build(),
                callback: response => {
                    const expectedDirective = {
                        type: APL_COMMANDS_TYPE,
                        token: VIDEO_PLAYER_VIEW_TOKEN,
                        commands: [
                            {
                                type: "Sequential",
                                commands: [
                                    {
                                        type: "ControlMedia",
                                        componentId: VIDEO_PLAYER_COMPONENT_ID,
                                        command: 'pause'
                                    }
                                ]
                            }
                        ]
                    };
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });
});