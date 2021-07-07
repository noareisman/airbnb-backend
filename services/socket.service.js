const orderService = require('../api/order/order.service')
const userService = require('../api/user/user.service')
const stayService = require('../api/stay/stay.service')
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
 
    const sharedSession = require('express-socket.io-session');
    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('renderOrders',(host)=>{
            gIo.emit ('loadOrders' ,host ) // should be - gIo.to(hostId).emit('loadOrders', host)// for reloading only for relevant user
        })
        socket.on('updateAns', (order)=>{
         gIo.emit ('updatedAns' ,order ) 
        })
        socket.on("private message", (anotherSocketId, msg) => {
              socket.to(anotherSocketId).emit("private message", socket.id, msg);
        });
    } ) 
}

function emit({ type, data }) {
    gIo.emit(type, data)
}
function emitToUser({ type, data, userSocketId }) {
    gIo.emit(type, data)
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}

module.exports = {
    connectSockets,
    broadcast,
    emit,
    emitToUser
}



