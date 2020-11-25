import { fail } from 'assert';
import { assert, expect } from 'chai';

import rewire = require('rewire');

const unitUnderTest = rewire("../../src/data/VideoIndex");
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