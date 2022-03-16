import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../');

const publicDirectory = join(root, 'public');
const audioDirectory = join(root, 'audio');
const soundsDirectory = join(audioDirectory, 'songs');

export default {
    port: process.env.PORT || 3000,
    dir: {
        root,
        publicDirectory,
        audioDirectory,
        fxDirectory: join(audioDirectory, 'fx')
    },
    pages: {
        homeHTML: 'home/index.html',
        controllerHTML: 'controller/index.html'
    },
    location: {
        home: '/home'
    },
    constants: {
        CONTENT_TYPE: {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript'
        },
        audioMediaType: 'mp3',
        soundVolume: '0.99',
        fallbackBitRate: '128000',
        englishConversation: join(soundsDirectory, 'conversation.mp3')
    }
};