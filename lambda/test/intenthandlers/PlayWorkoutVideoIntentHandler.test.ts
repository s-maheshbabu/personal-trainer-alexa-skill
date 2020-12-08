import { assert, expect } from 'chai';
const sinon = require("sinon");

import * as deepEqual from 'deep-equal';
const eventtypes = require("../../src/constants/EventTypes").eventtypes;

import { AlexaTest, IntentRequestBuilder, SkillSettings } from 'ask-sdk-test';
const skillSettings: SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
    debug: false,
};

import { rewiremock } from '../rewiremock';
import { handler as skillHandler } from '../../src/index';

const alexaTest = new AlexaTest(skillHandler, skillSettings);

const intentName = 'PlayWorkoutVideoIntent';

const workoutVideoViewDocument = require("../../src/response/display/WorkoutVideoView/document.json");
const { VIDEO_PLAYER_COMPONENT_ID, VIDEO_PLAYER_VIEW_TOKEN } = require("../../src/constants/APL");

const Duration_Key = "Duration";
const ExerciseLevel_Key = "ExerciseLevel";
const ExerciseType_Key = "ExerciseType";
const MuscleGroup_Key = "MuscleGroups";

describe("Playing the requested video on APL devices", () => {
    describe('should be able to search and play the requested workout video for different sets of parameters.', () => {
        const testcases: ({ [key: string]: any; } | string)[] = [
            // search by exercise type and duration
            [{
                [Duration_Key]: 5,
                [ExerciseType_Key]: 'CARDIO',
            }, 'https://url/3'
            ],
            // search by exercise type and duration and muscle group
            [{
                [Duration_Key]: 17,
                [ExerciseType_Key]: 'CARDIO',
                [MuscleGroup_Key]: ['BICEPS'],
            }, 'https://url/6'
            ],
            // search by exercise type and duration and exercise level
            [{
                [Duration_Key]: 20,
                [ExerciseLevel_Key]: 'HARD',
                [ExerciseType_Key]: 'STRETCHING',
            }, 'https://url/5'
            ],
            // search by exercise type and duration and exercise level and muscle group
            [{
                [Duration_Key]: 32,
                [ExerciseLevel_Key]: 'MEDIUM',
                [ExerciseType_Key]: 'CARDIO',
                [MuscleGroup_Key]: ['BICEPS'],
            }, 'https://url/4'
            ],
            // search by exercise type and exercise level
            [{
                [ExerciseLevel_Key]: 'HARD',
                [ExerciseType_Key]: 'CARDIO',
            }, 'https://url/3'
            ],
            // search by exercise type and exercise level and muscle group
            [{
                [ExerciseLevel_Key]: 'EASY',
                [ExerciseType_Key]: 'STRENGTH_TRAINING',
                [MuscleGroup_Key]: ['PECTORALS'],
            }, 'https://url/10'
            ],
            // search by exercise type and muscle group
            [{
                [ExerciseType_Key]: 'CARDIO',
                [MuscleGroup_Key]: ['BICEPS'],
            }, 'https://url/4'
            ],
            // the case where multiple muscle groups are given as input
            [{
                [ExerciseLevel_Key]: 'EASY',
                [ExerciseType_Key]: 'HIIT',
                [MuscleGroup_Key]: ['FOREARMS', 'TRICEPS'],
            }, 'https://url/9'
            ],
            // the case where there is only one matching video
            [{
                [Duration_Key]: 10,
                [ExerciseLevel_Key]: 'HARD',
                [ExerciseType_Key]: 'CARDIO',
                [MuscleGroup_Key]: ['UPPER_BACK'],
            }, 'https://url/3'
            ],
        ];

        for (let index = 0; index < testcases.length; index++) {
            const sessionAttributes = testcases[index][0];
            const expectedVideo = testcases[index][1];

            rewiremock.inScope(() => {
                rewiremock('ytdl-core').dynamic();
                rewiremock.enable();
                const skillHandler = require('../../src/index').handler;
                rewiremock.disable();

                const mockValues = setupYtdlCoreMock(expectedVideo);
                const alexaTest = new AlexaTest(skillHandler, skillSettings);

                alexaTest.test([
                    {
                        request: new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build(),
                        withSessionAttributes: sessionAttributes,
                        says: `Here is ${mockValues.mockVideoTitle} from ${mockValues.mockChannelName}. Enjoy your workout.`,
                        shouldEndSession: undefined,
                        get renderDocument() {
                            return {
                                token: VIDEO_PLAYER_VIEW_TOKEN,
                                document: (doc: any) => {
                                    return deepEqual(doc, workoutVideoViewDocument);
                                },
                                hasDataSources: {
                                    workoutVideoDataSource: (ds: any) => {
                                        assert(deepEqual(ds.workoutEndedEvent, {
                                            type: "SendEvent",
                                            arguments: [
                                                eventtypes.WorkoutEnded,
                                                mockValues.mockChannelName,
                                                expectedVideo,
                                                mockValues.mockVideoImageUrl,
                                            ]
                                        }));

                                        expect(ds.channelName).to.equal(mockValues.mockChannelName);
                                        expect(ds.originalUrl).to.equal(expectedVideo);
                                        expect(ds.playableUrl).to.equal(mockValues.mockPlayableURL);
                                        expect(ds.videoImageUrl).to.equal(mockValues.mockVideoImageUrl);
                                        expect(ds.videoPlayerId).to.equal(VIDEO_PLAYER_COMPONENT_ID);
                                        expect(ds.videoTitle).to.equal(mockValues.mockVideoTitle);

                                        return true;
                                    },
                                },
                            }
                        },
                    },
                ]);
            });


        }
    });

    describe('should render an appropriate error message when there are no playable videos matching the given criteria', () => {
        alexaTest.test([
            {
                request: new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: true }).build(),
                withSessionAttributes: {
                    [ExerciseType_Key]: 'YOGA',
                    [MuscleGroup_Key]: ['BICEPS'],
                },
                says: `I am sorry but I do not have any videos matching your preferences. Good bye.`,
                shouldEndSession: true,
            },
        ]);
    });
});

describe("non-APL devices", () => {
    describe('should render a prompt to indicate that the video cannot be played and that a link will be posted on the companion app.', () => {
        const sessionAttributes = {
            [ExerciseLevel_Key]: 'EASY',
            [ExerciseType_Key]: 'HIIT',
            [MuscleGroup_Key]: ['FOREARMS', 'TRICEPS'],
        };
        const expectedVideo = 'https://url/9';

        rewiremock.inScope(() => {
            rewiremock('ytdl-core').dynamic();
            rewiremock.enable();
            const skillHandler = require('../../src/index').handler;
            rewiremock.disable();

            const mockValues = setupYtdlCoreMock(expectedVideo);
            const alexaTest = new AlexaTest(skillHandler, skillSettings);

            alexaTest.test([
                {
                    request: new IntentRequestBuilder(skillSettings, intentName).withInterfaces({ apl: false }).build(),
                    withSessionAttributes: sessionAttributes,
                    says: `I found ${mockValues.mockVideoTitle} from ${mockValues.mockChannelName}. I put a link to the video in the Alexa app. By the way, try using the skill on Alexa devices with screen, like the Echo Show or Fire TV. I can play the video too on those devices.`,
                    shouldEndSession: true,
                    hasCardTitle: mockValues.mockVideoTitle,
                    hasCardContent: expectedVideo,
                },
            ]);
        });
    });
});

function setupYtdlCoreMock(url) {
    const mockChannelName = `mock-channel-name-for-${url}`;
    const mockChannelUrl = `mock-channel-url-for-${url}`;
    const mockPlayableURL = `mock-playable-url-for-${url}`;
    const mockVideoImageUrl = `mock-video-image-url-for-${url}`;
    const mockVideoTitle = `mock-video-title-for-${url}`;

    const videoInfo = { formats: [{ url: 'someUrl' }, { url: 'someOtherUrl' }], videoDetails: { author: { channel_url: mockChannelUrl, name: mockChannelName }, title: mockVideoTitle, thumbnail: { thumbnails: [{ url: 'someUrl' }, { url: 'someUrl' }, { url: mockVideoImageUrl }] } } };
    const ytdlGetInfoStub = sinon.stub();
    ytdlGetInfoStub
        .withArgs(url).onFirstCall().returns(videoInfo)
        .onSecondCall().throws("unexpected call to ytdl-core/getInfo");

    const ytdlChooseFormatStub = sinon.stub();
    ytdlChooseFormatStub
        .withArgs(videoInfo.formats, { filter: 'audioandvideo', quality: 'highestvideo' }).onFirstCall().returns({ url: mockPlayableURL })
        .onSecondCall().throws("unexpected call to ytdl-core/chooseFormat");

    const ytdlMock = rewiremock.getMock('ytdl-core');
    ytdlMock
        .with({
            getInfo: ytdlGetInfoStub,
            chooseFormat: ytdlChooseFormatStub,
        });

    return {
        mockChannelName: mockChannelName,
        mockChannelUrl: mockChannelUrl,
        mockPlayableURL: mockPlayableURL,
        mockVideoImageUrl: mockVideoImageUrl,
        mockVideoTitle: mockVideoTitle,
    }
}