import config from './config.js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { join, extname } from 'path';

const {
    dir: {
        publicDirectory
    }
} = config;

export class Service {

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

}