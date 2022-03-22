import childProcess from 'child_process';
import crypto from 'crypto';
import { once } from 'events';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { extname, join } from 'path';
import { PassThrough, Writable } from 'stream';
import streamPromises from 'stream/promises';
import Throttle from 'throttle';
import config from './config.js';
import { logger } from './util.js';

const {
    dir: {
        publicDirectory,
        fxDirectory
    },
    constants: {
        fallbackBitRate,
        bitrateDivisor,
        englishConversation
    }
} = config;

export class Service {

    constructor() {
        this.clientStreams = new Map();
        this.currentSound = englishConversation;
        this.currentBitrate = 0;
        this.throttleTransform = {};
        this.currentReadable = {};
    }

    createClientStream() {
        const id = crypto.randomUUID();
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

    broadcast() {
        return new Writable({
            write: (chunk, _, callback) => {
                for (const [id, stream] of this.clientStreams) {
                    // if the client has disconnected, we shouldn't send data to him anymore
                    if (stream.writableEnded) {
                        this.clientStreams.delete(id);
                        continue;
                    }

                    stream.write(chunk);
                }

                callback();
            }
        });
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

            await Promise.all([
                once(stdout, 'readable'),
                once(stderr, 'readable')
            ]);

            const [success, error] = [stdout, stderr].map(stream => stream.read());

            if (error) return await Promise.reject(error);

            return success.toString().trim().replace(/k/, '000');
        } catch (error) {
            logger.error(`something went bananas with the bitrate: ${error}`);
            return fallbackBitRate;
        }
    }

    async startStreamming() {
        logger.info(`starting with ${this.currentSound}`);
        const bitrate = this.currentBitrate = (await this.getBitrate(this.currentSound)) / bitrateDivisor;
        const throttleTransform = this.throttleTransform = new Throttle(bitrate);
        const soundReadable = this.currentReadable = this.createFileStream(this.currentSound);
        return streamPromises.pipeline(
            soundReadable,
            throttleTransform,
            this.broadcast()
        );
    }

    stopStreamming() {
        this.throttleTransform?.end?.();
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

    async getFxByName(fxName) {
        const sounds = await fsPromises.readdir(fxDirectory);
        const chosenSound = sounds.find(filename => filename.toLowerCase().includes(fxName));

        if (!chosenSound) {
            return Promise.reject(`the sound effect ${fxName} wasn't found!`);
        }

        return join(fxDirectory, chosenSound);
    }

};