require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const logger = require('./services/logger');

/**
 * Setup Server
 */
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
server.listen(PORT);
server.on('listening', () => {
    logger.info(`App started on port ${PORT}`)
});

/**
 * Setup sockets
 */
// const io = require('socket.io')(server, {origins: `${process.env.CLIENT}:*`});
const io = require('socket.io')(server);
// handle incoming connections from clients
io.on('connection', (socket) => {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', async (room) => {
        socket.join(room, () => {
            logger.info(socket.id + " now in rooms ", socket.rooms);
        });
    });

    socket.on('message', (data)=> {
        logger.info(data);
    });
});
