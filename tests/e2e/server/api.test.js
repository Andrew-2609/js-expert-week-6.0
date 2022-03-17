import { describe, expect, jest, test } from '@jest/globals';
import portfinder from 'portfinder';
import { Transform } from 'stream';
import supertest from 'supertest';
import { setTimeout } from 'timers/promises';
import Server from '../../../server/server.js';

const RETENTION_DATA_PERIOD = 200 // ms
const getAvailablePort = portfinder.getPortPromise;

describe('# API E2E Suite Test', () => {

    function pipeAndReadStreamData(stream, onChunk) {
        const transform = new Transform({
            transform(chunk, _, callback) {
                onChunk(chunk);
                callback(null, chunk);
            }
        });
        return stream.pipe(transform);
    }

    describe('client workflow', () => {

        async function getTestServer() {
            const getSuperTest = port => supertest(`http://localhost:${port}`);
            const port = await getAvailablePort();
            return new Promise((resolve, reject) => {
                const server = Server.listen(port)
                    .once('listening', () => {
                        const testServer = getSuperTest(port);
                        const response = {
                            testServer,
                            kill() {
                                server.close();
                            }
                        };

                        return resolve(response);
                    }).once('error', reject);
            });
        }

        test('it should not receive data stream is proccess is not playing', async () => {
            const server = await getTestServer();
            const onChunkFn = jest.fn();

            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunkFn
            );

            await setTimeout(RETENTION_DATA_PERIOD);

            server.kill();
            expect(onChunkFn).not.toHaveBeenCalled();
        });

        test.todo('it should receive data stream is proccess is playing');
    });
});