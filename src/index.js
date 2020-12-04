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
});

httpServer.listen(5001);
console.log("Server started on 5001");