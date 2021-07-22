const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// To get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);
const socket = io();

//To join Room
socket.emit("joinRoom", { username, room });

//To get Room and Users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Chat message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//To submit the message send by the user
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Sending the output message to the dom
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
   <p class="text">
      ${message.text}
   </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//To Display the Room name
function outputRoomName(room) {
  roomName.innerText = room;
}

let userstatus;
setInterval(() => {
  const element = document.getElementById("body");
  if (element.parentNode.matches(":hover")) {
    console.log("online");
  } else {
    console.log("offline");
  }
}, 2000);

//To Display the Room name
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
