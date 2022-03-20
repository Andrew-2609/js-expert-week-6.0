import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import crypto, { randomUUID } from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { join } from 'path';
import { PassThrough, Writable } from 'stream';
import StreamPromises from 'stream/promises';
import config from '../../../server/config.js';
import { Service } from '../../../server/service.js';
import { logger } from '../../../server/util.js';
import TestUtil from '../_util/testUtil.js';

const { dir: { publicDirectory }, constants: { fallbackBitRate, englishConversation } } = config;

describe('# Service - test suite for business and processing rules', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('should create the client stream with a PassThrough', async () => {
        const service = new Service();
        const id = 1;

        jest.spyOn(
            crypto,
            crypto.randomUUID.name
        ).mockReturnValue(id);

        jest.spyOn(
            Map.prototype,
            Map.prototype.set.name
        );

        const clientStream = service.createClientStream();

        expect(clientStream.id).toBe(id);
        expect(clientStream.clientStream).toBeInstanceOf(PassThrough);
    });

    test('should remove a client stream by its id', async () => {
        const service = new Service();
        const id = 1;

        jest.spyOn(
            Map.prototype,
            Map.prototype.delete.name
        );

        service.removeClientStream(id);

        expect(Map.prototype.delete).toHaveBeenCalledWith(id);
    });

    test('should broadcast', async () => {
        const service = new Service();
        const data = 'anything';

        const mockReadableStream = TestUtil.generateReadableStream([data])
        const mockWritableStream = TestUtil.generateWritableStream((chunk) => {
            expect(chunk.toString()).toBe(data);
        });

        service.clientStreams.set(1, mockWritableStream);

        const broadcast = service.broadcast();

        await StreamPromises.pipeline(mockReadableStream, broadcast);

        expect(broadcast).toBeInstanceOf(Writable);
    });

    test('should delete client stream on writable ended', async () => {
        const service = new Service();
        const data = 'anything';
        const uuid = randomUUID();

        const mockReadableStream = TestUtil.generateReadableStream([data]);
        const mockWritableStream = TestUtil.generateWritableStream();

        jest.spyOn(
            Map.prototype,
            Map.prototype.delete.name
        );

        jest.spyOn(
            Map.prototype,
            Map.prototype.set.name
        );

        service.clientStreams.set(uuid, mockWritableStream);

        mockWritableStream.end(); // end the stream

        const broadcast = service.broadcast();

        await StreamPromises.pipeline(mockReadableStream, broadcast);

        expect(broadcast).toBeInstanceOf(Writable);
        expect(Map.prototype.delete).toHaveBeenCalledWith(uuid);
        expect(service.clientStreams.size).toBe(0);
    });

    test('should get the bitrate of a given sound', async () => {
        const service = new Service();
        const sound = 'anySound.mp3';
        const args = ['--i', '-B', sound];
        const bitrate = ['128k', '128000'];

        const stderr = TestUtil.generateReadableStream('');
        const stdout = TestUtil.generateReadableStream([bitrate[0]]);

        jest.spyOn(
            Service.prototype,
            Service.prototype._executeSoxCommand.name
        ).mockReturnValue({ stderr, stdout });

        const result = await service.getBitrate(sound);

        expect(Service.prototype._executeSoxCommand).toHaveBeenCalledWith(args);
        expect(result).toBe(bitrate[1]);
    });

    test('should reject when invalid sound file is processed in getBitrate', async () => {
        const service = new Service();
        const errorMessage = 'error while testing this method';

        const stderr = TestUtil.generateReadableStream([errorMessage]);
        const stdout = TestUtil.generateReadableStream('');

        jest.spyOn(
            Service.prototype,
            Service.prototype._executeSoxCommand.name
        ).mockReturnValue({ stderr, stdout });

        jest.spyOn(
            logger,
            'error'
        );

        const result = await service.getBitrate('invalid.mp3');

        expect(result).toBe(fallbackBitRate);
        expect(logger.error).toHaveBeenCalledWith(`something went bananas with the bitrate: ${errorMessage}`);
    });

    test('should create a file stream and return it', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const service = new Service();

        jest.spyOn(
            fs,
            fs.createReadStream.name
        ).mockReturnValue(mockFileStream);

        const fileStream = service.createFileStream('anyfile');

        expect(fileStream).toStrictEqual(mockFileStream);
    });

    test('should get the file info including name and type', async () => {
        const fileName = 'anyfile.html';
        const service = new Service();

        jest.spyOn(
            fsPromises,
            fs.promises.access.name
        ).mockResolvedValue();

        const fileInfo = await service.getFileInfo(fileName);

        expect(fileInfo).toStrictEqual({
            name: join(publicDirectory, fileName),
            type: '.html'
        });
    });

    test('should get a file stream from file info', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const service = new Service();

        jest.spyOn(
            Service.prototype,
            Service.prototype.getFileInfo.name
        ).mockResolvedValue({
            name: 'index.html',
            type: '.html'
        });

        jest.spyOn(
            Service.prototype,
            Service.prototype.createFileStream.name
        ).mockReturnValue(mockFileStream);

        const fileStream = await service.getFileStream('anyFile');

        expect(fileStream).toStrictEqual({
            stream: mockFileStream,
            type: '.html'
        });
    });

    test('should start streamming', async () => {
        const service = new Service();
        const mockFileStream = TestUtil.generateReadableStream(['anything']);

        jest.spyOn(
            logger,
            'info'
        );

        jest.spyOn(
            Service.prototype,
            Service.prototype.getBitrate.name
        ).mockResolvedValue('128000');

        jest.spyOn(
            Service.prototype,
            Service.prototype.createClientStream.name
        ).mockReturnValue(mockFileStream);

        jest.spyOn(
            Service.prototype,
            Service.prototype.broadcast.name
        );

        jest.spyOn(
            StreamPromises,
            'pipeline'
        ).mockResolvedValue(mockFileStream);

        const stream = await service.startStreamming();

        expect(stream).toEqual(mockFileStream);
        expect(Service.prototype.broadcast).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(`starting with ${englishConversation}`);
    });
});