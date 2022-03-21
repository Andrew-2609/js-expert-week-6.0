import { describe, expect, jest, test } from '@jest/globals';
import portfinder from 'portfinder';
import { Transform } from 'stream';
import supertest from 'supertest';
import { setTimeout } from 'timers/promises';
import config from '../../../server/config.js';
import Server from '../../../server/server.js';
import fsPromises from 'fs/promises';

const RETENTION_DATA_PERIOD = 200 // ms
const { dir: { publicDirectory }, pages: { homeHTML }, location: { home } } = config;

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

        // this function is responsible for sending the given commands
        async function commandSender(testServer) {
            return {
                async send(command) {
                    const response = await testServer.post('/controller').send({ command });
                    expect(response.text).toStrictEqual(commandResponse);
                }
            }
        }

        test('should redirect user to /home endpoint with status 302', async () => {
            const server = await getTestServer();

            const response = await server.testServer.get('/');

            expect(response.status).toBe(302);
            expect(response.header.location).toBe(home);

            server.kill();
        });

        test('should exibit home page html file', async () => {
            const server = await getTestServer();
            const homeFile = await fsPromises.readFile(
                `${publicDirectory}/${homeHTML}`
            );

            const { status, text } = await server.testServer.get('/home');

            expect(status).toBe(200);
            expect(text).toEqual(homeFile.toString());

            server.kill();
        });

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