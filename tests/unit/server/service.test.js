import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import fs from 'fs';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';

describe('# Service - test suite for business and processing rules', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('should create a file stream and return it', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const service = new Service();

        jest.spyOn(
            fs,
            'createReadStream'
        ).mockReturnValue(mockFileStream);

        const fileStream = service.createFileStream('anyfile');

        expect(fileStream).toEqual(mockFileStream);
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

        expect(fileStream).toEqual({
            stream: mockFileStream,
            type: '.html'
        });
    });
});