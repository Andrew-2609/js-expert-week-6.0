import server from './server';

server.listen(3000).on('listening', () => {console.log('Server running on port 3000')});