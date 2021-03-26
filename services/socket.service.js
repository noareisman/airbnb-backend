const orderService = require('../api/order/order.service')
const userService = require('../api/user/user.service')
const stayService = require('../api/stay/stay.service')
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}
// var hostSocketId=

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
    const sharedSession = require('express-socket.io-session');
    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('a user connected');
        console.log('socket.id',socket.id);
        console.log('socket.handshake', socket.handshake)
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)//??????????
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        //Noa//
        //chat topic variation:
        socket.on('show interst in stay', stay => {
            if (socket.currStay === stay) return;
            if (socket.currStay) {
                socket.leave(socket.currStay)
            }
            socket.join(stay)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.currStay = stay
        })
        //new Msg variation:
        socket.on('stay newOrder', order => {
            // emits only to sockets in the same room
            // gIo.to(socket.currStay).emit('stay was just booked', order)////////////////////ERAN
            
            //TODO:make async
            //toyService.addMsg({msg,toyId})///////IFAT
            // userService.getById(order.)
            socket.to(socket.currStay).emit('stay placeOrderPlz',order)/////////////////////IFA

        })
        socket.on('test',(str)=>{
            console.log(str);
        })
        //privat chat room
        socket.on("private message", (anotherSocketId, msg) => {
              socket.to(anotherSocketId).emit("private message", socket.id, msg);
        });
        socket.on('loadOrders',(order)=>{
            // io.to()
        });

    } ) 
    

}




//IFAT
function emit({ type, data }) {
    gIo.emit(type, data)
}
//
//ERAN
// function emitToAll({ type, data, room = null }) {
//     if (room) gIo.to(room).emit(type, data)
//     else gIo.emit(type, data)
// }
//

// priver message
function emitToUser({ type, data, userSocketId }) {
    gIo.to(userSocketId).emit(type, data)
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
    // emitToAll,/////////////////////////////////////////////////////// ERAN
    broadcast,
    emit
}



