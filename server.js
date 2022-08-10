const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
var userList = [];
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use("/", express.static("public"));
app.use("/", express.static("node_modules"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  const filteredUsers = userList.filter(user => user.roomId == req.params.room);
  res.render("room", { roomId: req.params.room, filteredUsers });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    // console.log(userId);
    socket.join(roomId);
    let userObj = { userId, roomId, userName };
    userList.push(userObj)
    socket.to(roomId).emit("user-connected", userId);
    io.to(roomId).emit("userlist", userList);
    socket.on("message", (message) => {

      io.to(roomId).emit("createMessage", message, userName);
      
    });
  });
});

server.listen(process.env.PORT || 3030, (port) => console.log(`server is listening on port ${port}`));
