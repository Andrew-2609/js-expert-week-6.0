import { describe, test } from '@jest/globals';
import portfinder from 'portfinder';
import Server from '../../../server/server.js';

const getAvailablePort = portfinder.getPortPromise;

describe('# API E2E Suite Test', () => {
    describe('client workflow', () => {

        async function getTestServer() {
            const getSuperTest = port => `http://localhost:${port}`;
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

        test.todo('it should not receive data stream is proccess is not playing');
        test.todo('it should receive data stream is proccess is playing');
    });
});