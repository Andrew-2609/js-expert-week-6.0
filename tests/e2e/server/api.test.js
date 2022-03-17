import { describe, expect, jest, test } from '@jest/globals';
import portfinder from 'portfinder';
import { Transform } from 'stream';
import supertest from 'supertest';
import { setTimeout } from 'timers/promises';
import Server from '../../../server/server.js';

const RETENTION_DATA_PERIOD = 200 // ms
const getAvailablePort = portfinder.getPortPromise;

describe('# API E2E Suite Test', () => {
    const commandResponse = JSON.stringify({ result: 'ok' });
    const possibleCommands = { start: 'start', stop: 'stop' };

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
        // this function is responsible for isolating the test servers
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

        async function commandSender(testServer) {
            return {
                async send(command) {
                    const response = await testServer.post('/controller').send({ command });
                    expect(response.text).toStrictEqual(commandResponse);
                }
            }
        }

        test('it should not receive data stream if proccess is not playing', async () => {
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

        test('it should receive data stream if proccess is playing', async () => {
            const server = await getTestServer();
            const onChunkFn = jest.fn();
            const { send } = await commandSender(server.testServer);

            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunkFn
            );

            await send(possibleCommands.start);

            await setTimeout(RETENTION_DATA_PERIOD);

            await send(possibleCommands.stop);

            const [[buffer]] = onChunkFn.mock.calls

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(1000)

            server.kill();
        });
    });
});