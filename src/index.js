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
  const userId = userList.findIndex((user) => user.socketId === socketId)
  if (userId !== -1) {
    userList[userId].online = false
  }
}

io.on("connection", (socket) => {

  const uid = socket.id;
  console.log("Connection", uid);
  io.sockets.emit('join', uid);

  socket.on('disconnect', (reason) => {
    userOffline(uid);
    console.log('Disconnect', reason, uid)
    io.sockets.emit('leave', uid);
  })

  socket.on('message', (message) => {
    console.log(`IN | ${uid} |`, message)
    io.sockets.emit('message', message)
  })

  socket.on('namechange', (userProfile) => {
    addUser(userProfile.body, uid);
    console.log(`NC ${uid} |`, userProfile.body.name)
    io.sockets.emit('namechange', userProfile)
  })
  
  socket.on('rolecall', () => {
    console.log('RC', ...userList)
    socket.emit('userlist', userList)
  })

});

httpServer.listen(5001);
console.log("Server started on 5001");