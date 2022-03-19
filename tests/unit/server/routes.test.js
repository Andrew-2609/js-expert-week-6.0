import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import events from 'events';
import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

const { pages, location, constants: { CONTENT_TYPE } } = config;

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

    test(`GET /home - should respond with ${pages.homeHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams();

        params.request.method = 'GET';
        params.request.url = '/home';

        const mockFileStream = TestUtil.generateReadableStream(['anything']);

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream
        });

        jest.spyOn(
            mockFileStream,
            'pipe'
        ).mockReturnValue();

        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test(`GET /controller - should respond with ${pages.controllerHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams();

        params.request.method = 'GET';
        params.request.url = '/controller';

        const mockFileStream = TestUtil.generateReadableStream(['anything']);

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream
        });

        jest.spyOn(
            mockFileStream,
            'pipe'
        ).mockReturnValue();

        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test(`GET /index.html - should respond with file stream`, async () => {
        const params = TestUtil.defaultHandleParams();
        const fileName = '/index.html';

        params.request.method = 'GET';
        params.request.url = `${fileName}`;

        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const expectedType = '.html';

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        });

        jest.spyOn(
            mockFileStream,
            'pipe'
        ).mockReturnValue();

        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
        expect(params.response.writeHead).toHaveBeenCalledWith(
            200,
            { 'Content-Type': CONTENT_TYPE[expectedType] }
        );
    });

    test(`GET /file.ext - should respond with file stream`, async () => {
        const params = TestUtil.defaultHandleParams();
        const fileName = '/file.ext';

        params.request.method = 'GET';
        params.request.url = `${fileName}`;

        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const expectedType = '.ext';

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        });

        jest.spyOn(
            mockFileStream,
            'pipe'
        ).mockReturnValue();

        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toBeCalledWith(fileName);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
        expect(params.response.writeHead).not.toHaveBeenCalledWith(
            200,
            { 'Content-Type': CONTENT_TYPE[expectedType] }
        );
    });

    test(`POST /unknown - should respond with 404`, async () => {
        const params = TestUtil.defaultHandleParams();

        params.request.method = 'POST';
        params.request.url = `/unknown`;

        await handler(...params.values());

        expect(params.response.writeHead).toHaveBeenCalledWith(404);
        expect(params.response.end).toHaveBeenCalled();
    });

    test(`GET /stream - should create client stream and pipe it`, async () => {
        const params = TestUtil.defaultHandleParams();

        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const onCloseFn = jest.fn();

        params.request.method = 'GET';
        params.request.url = '/stream';

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.createClientStream.name
        ).mockReturnValue({
            stream: mockFileStream,
            onClose: onCloseFn
        });

        jest.spyOn(
            mockFileStream,
            'pipe'
        ).mockReturnValue();

        await handler(...params.values());

        expect(params.response.writeHead).toHaveBeenCalledWith(
            200,
            {
                'Content-Type': 'audio/mpeg',
                'Accept-Ranges': 'bytes'
            }
        );

        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test(`POST /controller - should respond to command with result ok`, async () => {
        const params = TestUtil.defaultHandleParams();
        const command = { command: 'any' };
        const result = { result: 'ok' };

        params.request.method = 'POST';
        params.request.url = `/controller`;

        jest.spyOn(
            events,
            events.once.name
        ).mockResolvedValue(command);

        jest.spyOn(
            JSON,
            JSON.parse.name
        ).mockReturnValue(command);

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.handleCommand.name
        ).mockResolvedValue(result);

        await handler(...params.values());

        expect(events.once).toHaveBeenCalledWith(params.request, 'data');
        expect(JSON.parse).toHaveBeenCalledWith(command);
        expect(Controller.prototype.handleCommand).toHaveBeenCalledWith(command);
        expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(result));
    });

    describe('exceptions', () => {
        test(`given an nonexistent file it should respond with 404`, async () => {
            const params = TestUtil.defaultHandleParams();

            params.request.method = 'GET';
            params.request.url = `/unknown`;

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            ).mockRejectedValue(new Error('Error: ENOENT'));

            await handler(...params.values());

            expect(params.response.writeHead).toHaveBeenCalledWith(404);
            expect(params.response.end).toHaveBeenCalled();
        });

        test(`given an unhandled error it should respond with 500`, async () => {
            const params = TestUtil.defaultHandleParams();

            params.request.method = 'GET';
            params.request.url = `/index.png`;

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            )
                .mockRejectedValue(new Error('Unknwon Error'));

            await handler(...params.values());

            expect(params.response.writeHead).toHaveBeenCalledWith(500);
            expect(params.response.end).toHaveBeenCalled();
        });
    });
});