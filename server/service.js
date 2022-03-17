import childProcess from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { extname, join } from 'path';
import { PassThrough } from 'stream';
import config from './config.js';
import { logger } from './util.js';

const {
    dir: {
        publicDirectory
    },
    constants: {
        fallbackBitRate
    }
} = config;

export class Service {

    constructor() {
        this.clientStreams = new Map();
    }

    createClientStream() {
        const id = randomUUID();
        const clientStream = new PassThrough();
        this.clientStreams.set(id, clientStream);

        return {
            id,
            clientStream
        };
    }

    removeClientStream(id) {
        this.clientStreams.delete(id);
    }

    // '_' indicates a private function
    _executeSoxCommand(args) {
        return childProcess.spawn('sox', args);
    }

    async getBitrate(sound) {
        try {
            const args = [
                '--i', // info
                '-B', // bit rate
                sound
            ];

            const {
                stderr, // every error
                stdout, // every log
                // stdin // every input
            } = this._executeSoxCommand(args);

            const [success, error] = [stdout, stderr].map(stream => stream.read());

            if (error) return await Promise.reject(error);

            return success.toSring().trim().replace(/k/, '000');
        } catch (error) {
            logger.error(`something went bananas with the bitrate: ${error}`);
            return fallbackBitRate;
        }
    }

    createFileStream(filename) {
        return fs.createReadStream(filename);
    }

    async getFileInfo(file) { // file = home/index.html
        const fullFilePath = join(publicDirectory, file);
        await fsPromises.access(fullFilePath); // validate if the file exists ; if it doesn't, throws an Error!
        const fileType = extname(fullFilePath); // .html, .pdf, etc.
        return {
            name: fullFilePath,
            type: fileType
        }
    }

    async getFileStream(file) {
        const { name, type } = await this.getFileInfo(file);
        return {
            stream: this.createFileStream(name),
            type: type
        };
    }

};