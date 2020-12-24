import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e4,
  cors: {
    origin: "http://localhost:5005",
    methods: ["GET", "POST"]
  }
});

let userList = [];

const addUser = (userProfile, socketId) => {
  const userId = userList.findIndex((user) => user.uid === userProfile.uid)
  if (userId !== -1) {
    userList[userId].name = userProfile.name
    userList[userId].online = true
    userList[userId].socketId = socketId
  } else {
    userList.push({
      ...userProfile,
      socketId,
      online: true
    })
  }
}

const userOffline = (socketId) => {

  const userSocketIds = [...userList].map((user) => user.socketId)
  const userId = userSocketIds.findIndex((userSocket) => userSocket === socketId)

  console.log('USERS', userSocketIds)
  console.log('DISCONNECTING', socketId)
  console.log('UID', userId)
  
  if (userId !== -1) {
    userList[userId].online = false
  }
}

io.on("connection", (socket) => {

  const uid = socket.id;
  console.log("Connection", uid);
  
  socket.on('ident', (userProfile) => {
    addUser(userProfile.body, uid);
    io.sockets.emit('join', { ...userProfile.body });
    console.log(`ID | ${userProfile.body.uid}`)
  })

  socket.on('disconnect', (reason) => {   
    
    let userId = [...userList].findIndex((user) => user.socketId === uid);
    let leavingUser = userId === -1 ? uid : userList[userId]
        
    userOffline(leavingUser.socketId || uid);
    
    io.sockets.emit('leave', leavingUser);
    
    console.log('Disconnect', reason, uid)
  })

  socket.on('message', (message) => {   
    io.sockets.emit('message', {
      message,
      socketId: uid
    })
    console.log(`IN | ${uid} |`, {message, uid})
  })

  socket.on('namechange', (userProfile) => {
    addUser(userProfile.body, uid);
    io.sockets.emit('namechange', userProfile)
    console.log(`NC ${uid} |`, userProfile.body.name)
  })
  
  socket.on('rolecall', () => {
    socket.emit('userlist', userList)
    console.log('RC', userList)
  })

});

httpServer.listen(5001);
console.log("Server started on 5001");