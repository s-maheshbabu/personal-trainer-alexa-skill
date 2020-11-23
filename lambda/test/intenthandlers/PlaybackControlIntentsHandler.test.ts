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
const getCommand = require("constants/PlaybackControlCommands").getCommand;

describe("Playback Controls", () => {
    describe('should be able to pause a video', () => {
        const intentName = 'AMAZON.PauseIntent';
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).build(),
                callback: response => {
                    const expectedDirective = buildPlaybackControlsDirective('pause');
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });

    describe('should be able to resume a video', () => {
        const intentName = 'AMAZON.ResumeIntent';
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).build(),
                callback: response => {
                    const expectedDirective = buildPlaybackControlsDirective('play');
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });

    describe('should be able to skip to the next video', () => {
        const intentName = 'AMAZON.NextIntent';
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).build(),
                callback: response => {
                    const expectedDirective = buildPlaybackControlsDirective('next');
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });

    describe('should be able to go to the previous video', () => {
        const intentName = 'AMAZON.PreviousIntent';
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).build(),
                callback: response => {
                    const expectedDirective = buildPlaybackControlsDirective('previous');
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });

    describe('should be able to start over a video', () => {
        const intentName = 'AMAZON.StartOverIntent';
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).build(),
                callback: response => {
                    const expectedDirective = buildPlaybackControlsDirective('rewind', 'play');
                    const playbackCommandDirective = response.response.directives[0];
                    assert(deepEqual(playbackCommandDirective, expectedDirective), `Expected: ${JSON.stringify(expectedDirective)} Actual: ${JSON.stringify(playbackCommandDirective)}`);
                },
                shouldEndSession: undefined,
            },
        ]);
    });

    describe('should deliver an appropriate error message for all unsupported playback control intents.', () => {
        const unsupportedIntents =
            [
                'AMAZON.RepeatIntent',
                'AMAZON.LoopOnIntent',
                'AMAZON.LoopOffIntent',
                'AMAZON.ShuffleOffIntent',
                'AMAZON.ShuffleOnIntent',
            ];
        unsupportedIntents.forEach(intentName => {
            alexaTest.test([
                {
                    request: new IntentRequestBuilder(skillSettings, intentName).build(),
                    says: `I am sorry but I currently do not support that.`,
                    repromptsNothing: true,
                    shouldEndSession: undefined,
                },
            ]);
        });
    });
});

function buildPlaybackControlsDirective(...commands) {
    return {
        type: APL_COMMANDS_TYPE,
        token: VIDEO_PLAYER_VIEW_TOKEN,
        commands: [
            {
                type: "Sequential",
                commands: buildPlaybackControlsCommands(...commands),
            }
        ]
    };
}

function buildPlaybackControlsCommands(...commands) {
    const commandObjects = [];
    commands.forEach(command => commandObjects.push({
        type: "ControlMedia",
        componentId: VIDEO_PLAYER_COMPONENT_ID,
        command: command,
    }));

    return commandObjects;
}