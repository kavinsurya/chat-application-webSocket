const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io");
const io = socket(server);
const formatMessage = require("./utlis/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utlis/users");

app.use(express.static(path.join(__dirname, "public")));

//bot Name
const botName = "Chat Bot";

//Client conection
io.on("connection", (socket) => {
  console.log("Connection established");
  //When user joins room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    //Chat bot Welcomes the new user
    socket.emit("message", formatMessage(botName, "Welcome to Chat cord"));
    //Broadcasts when new user in connected
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `A ${user.username} has connected`)
      );
    //To send user and room information
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //The chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    console.log(msg);
  });
  //When the user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      //To send user and room information
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
