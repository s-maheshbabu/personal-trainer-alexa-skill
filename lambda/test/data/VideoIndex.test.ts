const Alexa = require('ask-sdk-core');

import { fail } from 'assert';
import { assert, expect } from 'chai';
const sinon = require("sinon");

import rewire = require('rewire');

import { rewiremock } from '../rewiremock';
rewiremock('ytdl-core').dynamic();
rewiremock.enable();
const unitUnderTest = rewire("../../src/data/VideoIndex");
rewiremock.disable();

const search = unitUnderTest.__get__('search');

describe("Search for videos in the repository", () => {
    it('should be able to find a video for a valid exercise type', async () => {
        const urls = await search('STRENGTH_TRAINING');

        const expectedUrls = ['https://url/1', 'https://url/10'];
        expect(urls).to.eql(expectedUrls);
    });

    it('should be able to filter videos by duration. We should only return videos that are shorter than or equal to the requested duration.', async () => {
        const urls = await search('CARDIO', 10);

        const expectedUrls = ['https://url/2', 'https://url/3'];
        expect(urls).to.eql(expectedUrls);
    });

    it('should be able to filter videos by a given muscle group.', async () => {
        const urls = await search('STRENGTH_TRAINING', undefined, ['ABDOMINALS']);

        const expectedUrls = ['https://url/1'];
        expect(urls).to.eql(expectedUrls);
    });

    it('should be able to filter videos by a given muscle groups when more than one muscle group is given.', async () => {
        const urls = await search('YOGA', undefined, ['ABDOMINALS', 'UPPER_BACK']);

        const expectedUrls = ['https://url/3'];
        expect(urls).to.eql(expectedUrls);
    });

    it('should be able to filter videos by a difficulty level.', async () => {
        const urls = await search('STRETCHING', undefined, undefined, 'HARD');

        const expectedUrls = ['https://url/5'];
        expect(urls).to.eql(expectedUrls);
    });

    it('should return an empty array when no matching workouts are found.', async () => {
        const urls = await search('STRETCHING', 17, ['GLUTES'], 'HARD');

        assert(Array.isArray(urls));
        expect(urls.length).to.equal(0);
    });

    it('should throw an error is exercise type is not provided.', async () => {
        try {
            await search(undefined,);
            fail('Expected an error to be thrown because the exersice type was missing but no errors where thrown.')
        } catch (error) {
            expect(error.message).to.eql('Exercise Type is a required argument.');
        }
    });

    it('should throw an error if muscle groups is provided but is not a valid non-empty array.', async () => {
        const invalidMuscleGroupsInputs = ['not an array', []];
        for (let i = 0; i < invalidMuscleGroupsInputs.length; i++) {
            const invalidMuscleGroupsInput = invalidMuscleGroupsInputs[i];
            try {
                await search('STRENGTH_TRAINING', undefined, invalidMuscleGroupsInput, undefined);
                fail('Expected an error to be thrown because the muscle grousp input is invalid but no errors where thrown.')
            } catch (error) {
                expect(error.message).to.eql(`Invalid muscle groups input: ${invalidMuscleGroupsInput}`);
            }
        }
    });
});

describe("Escape SSML characters. The video metadata is out of our control and can contain ssml-invalid characters like &. So we need to clean it up.", () => {
    it('should escape invalid characters in the video title and channel name because they might be spoken somewhere down the line.', async () => {
        const expectedUrl = 'https://url/3';

        const mockChannelName = `mock & channel with & invalid characters`;
        const mockPlayableURL = `mock-playable-url`;
        const mockVideoTitle = `mock & video title with & invalid characters`;

        const videoInfo = { formats: [{ url: 'someUrl' }, { url: 'someOtherUrl' }], videoDetails: { author: { name: mockChannelName }, title: mockVideoTitle } };
        const ytdlGetInfoStub = sinon.stub();
        ytdlGetInfoStub
            .withArgs(expectedUrl).onFirstCall().returns(videoInfo)
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

        const playable = await unitUnderTest.getPlayableVideo('YOGA', undefined, ['ABDOMINALS', 'UPPER_BACK']);

        expect(playable.channelName).to.eql(Alexa.escapeXmlCharacters(mockChannelName));
        expect(playable.title).to.eql(Alexa.escapeXmlCharacters(mockVideoTitle));
        expect(playable.url).to.eql(Alexa.escapeXmlCharacters(mockPlayableURL));
    });
});
