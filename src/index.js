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

io.on("connection", (socket) => {
  const uid = socket.id;
  console.log("Connection", uid);

  socket.on('disconnect', (reason) => {
    console.log('Disconnect', reason, uid)
    io.sockets.emit('leave', uid);
  })

  socket.on('message', (message) => {
    console.log(`IN | ${uid} |`, message)
    io.sockets.emit('message', message)
  })
  
  socket.on('namechange', (name) => {
    console.log(`NC ${uid} |`, name)
    io.sockets.emit('namechange', name)
  })

});

httpServer.listen(5001);
console.log("Server started on 5001");