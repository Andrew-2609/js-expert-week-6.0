import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import config from '../../../server/config.js';

const { pages } = config;

describe('#Routes - test suite for API response', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test.todo('GET / - should redirect to home page');
    test.todo(`GET /home - should respond with ${pages.homeHTML} file stream`);
    test.todo(`GET /controller - should respond with ${pages.controllerHTML} file stream`);
    test.todo(`GET /file.ext - should respond with file stream`);
    test.todo(`GET /unknown - should respond with 404`);

    describe('exceptions', () => {
        test.todo(`given an nonexistent file it should respond with 404`);
        test.todo(`given an unhandled error it should respond with 500`);
    });
});