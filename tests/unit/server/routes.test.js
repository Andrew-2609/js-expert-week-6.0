import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import config from '../../../server/config.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

const { pages, location } = config;

describe('#Routes - test suite for API response', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('GET / - should redirect to home page', async () => {
        const params = TestUtil.defaultHandleParams();

        params.request.method = 'GET';
        params.request.url = '/';

        /* Unnecessary, since params.response.writeHead is already a jest.fn
        jest.spyOn(
            params.response,
            params.response.writeHead.name
        ).mockReturnValue();
        */

        await handler(...params.values());

        expect(params.response.writeHead).toBeCalledWith(
            302,
            { 'Location': location.home }
        );

        expect(params.response.end).toBeCalled();
    });

    test.todo(`GET /home - should respond with ${pages.homeHTML} file stream`);
    test.todo(`GET /controller - should respond with ${pages.controllerHTML} file stream`);
    test.todo(`GET /file.ext - should respond with file stream`);
    test.todo(`GET /unknown - should respond with 404`);

    describe('exceptions', () => {
        test.todo(`given an nonexistent file it should respond with 404`);
        test.todo(`given an unhandled error it should respond with 500`);
    });
});