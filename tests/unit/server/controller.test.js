import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Controller } from '../../../server/controller.js';
import { Service } from '../../../server/service.js';
import { logger } from '../../../server/util.js';
import TestUtil from '../_util/testUtil.js';

describe('# Controller - test suite for intermediate layer', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('should get file stream from server', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const expectedType = '.html';
        const controller = new Controller();

        jest.spyOn(
            Service.prototype,
            Service.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        });

        const fileStream = await controller.getFileStream('anything');

        expect(Service.prototype.getFileStream).toBeCalledWith('anything');
        expect(fileStream).toStrictEqual({
            stream: mockFileStream,
            type: expectedType
        });
    });

    test('should create a client stream', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['anything']);
        const controller = new Controller();
        const id = 1;
        const loggerMessage = `closing connection of ${id}`;

        jest.spyOn(
            Service.prototype,
            Service.prototype.createClientStream.name
        ).mockReturnValue({
            id: id,
            clientStream: mockFileStream
        });

        jest.spyOn(
            Service.prototype,
            Service.prototype.removeClientStream.name
        ).mockReturnValue();

        jest.spyOn(
            logger,
            'info'
        ).mockReturnValue();

        const { stream, onClose } = controller.createClientStream();

        onClose(); // calling onClose function to test its behaviour

        expect(stream).toEqual(mockFileStream);
        expect(onClose).not.toBeNull();
        expect(Service.prototype.removeClientStream).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(loggerMessage);
    });

    test('should handle start command', async () => {
        const { command } = { command: 'start' };
        const infoMessage = `command received: ${command.command}`;
        const controller = new Controller();

        jest.spyOn(
            logger,
            'info'
        );

        jest.spyOn(
            String.prototype,
            String.prototype.toLowerCase.name,
        ).mockReturnValue(command);

        jest.spyOn(
            String.prototype,
            String.prototype.includes.name
        );

        jest.spyOn(
            Service.prototype,
            Service.prototype.startStreamming.name
        );

        const result = await controller.handleCommand('anything');

        expect(logger.info).toHaveBeenCalledWith(infoMessage);
        expect(String.prototype.includes).toHaveBeenCalledWith(command);
        expect(Service.prototype.startStreamming).toHaveBeenCalled();
        expect(result).toStrictEqual({ result: 'ok' });
    });

    test('should handle stop command', async () => {
        const { command } = { command: 'stop' };
        const infoMessage = `command received: ${command.command}`;
        const controller = new Controller();

        jest.spyOn(
            logger,
            'info'
        );

        jest.spyOn(
            String.prototype,
            String.prototype.toLowerCase.name,
        ).mockReturnValue(command);

        jest.spyOn(
            String.prototype,
            String.prototype.includes.name
        );

        jest.spyOn(
            Service.prototype,
            Service.prototype.stopStreamming.name
        );

        const result = await controller.handleCommand('anything');

        expect(logger.info).toHaveBeenCalledWith(infoMessage);
        expect(String.prototype.includes).toHaveBeenCalledWith(command);
        expect(Service.prototype.stopStreamming).toHaveBeenCalled();
        expect(result).toStrictEqual({ result: 'ok' });
    });

    test('should append sound effect to stream when handling given command', async () => {
        const inputData = { command: 'roar' };
        const chosenFx = 'T-Rex Roaring (128 kbps).mp3';
        const infoMessage = `added fx to service: ${chosenFx}`;
        const controller = new Controller();

        jest.spyOn(
            Service.prototype,
            Service.prototype.getFxByName.name
        ).mockResolvedValue(chosenFx);

        jest.spyOn(
            Service.prototype,
            Service.prototype.appendFxToStream.name
        ).mockReturnValue();

        jest.spyOn(
            logger,
            'info'
        );

        const result = await controller.handleCommand(inputData);

        expect(Service.prototype.getFxByName).toHaveBeenCalledWith(inputData.command.toLowerCase());
        expect(logger.info).toHaveBeenCalledWith(infoMessage);
        expect(Service.prototype.appendFxToStream).toHaveBeenCalledWith(chosenFx);
        expect(result).toStrictEqual({ result: 'ok' });
    });

    test('should reject nonexistent command', () => {
        const inputData = { command: 'aplausos' };
        const rejectMessage = `the sound effect ${inputData.command} wasn't found!`;
        const controller = new Controller();

        jest.spyOn(
            Service.prototype,
            Service.prototype.appendFxToStream.name
        );

        expect(controller.handleCommand(inputData)).rejects.toEqual(rejectMessage);
        expect(Service.prototype.appendFxToStream).not.toHaveBeenCalled();
    });
});