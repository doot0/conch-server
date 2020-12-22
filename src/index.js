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
  } else {    
    userList.push({
      ...userProfile,
      socketId,
      online: true
    })
  }
}

const userOffline = (socketId) => {
  console.error('user going offline', socketId);
  const userId = userList.findIndex((user) => user.socketId === socketId)
  if (userId !== -1) {
    userList[userId].online = false
  }
}

io.on("connection", (socket) => {

  const uid = socket.id;
  console.log("Connection", uid);
  
  socket.on('ident', (userProfile) => {
    addUser(userProfile.body, userProfile.body.uid);
    io.sockets.emit('join', { ...userProfile.body });
    console.log(`ID | ${userProfile.body.uid}`)
  })

  socket.on('disconnect', (reason) => {
    userOffline(uid);
    io.sockets.emit('leave', uid);
    console.log('Disconnect', reason, uid)
  })

  socket.on('message', (message) => {   
    io.sockets.emit('message', message)    
    console.log(`IN | ${uid} |`, message)
  })

  socket.on('namechange', (userProfile) => {
    addUser(userProfile.body, uid);
    io.sockets.emit('namechange', userProfile)
    console.log(`NC ${uid} |`, userProfile.body.name)
  })
  
  socket.on('rolecall', () => {
    socket.emit('userlist', userList)
  })

});

httpServer.listen(5001);
console.log("Server started on 5001");