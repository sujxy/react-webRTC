import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server } from "socket.io";

const app = express();
const io = new Server({ cors: true });
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const port = process.env.PORT || 6001;
const emailToSocketMap = new Map();

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log("new connection!");
  socket.on("join-room", (data) => {
    const { emailId, roomId } = data;
    emailToSocketMap.set(emailId, socket.id);
    socket.join(roomId);
    socket.emit("joined-room", { roomId: roomId, emailId: emailId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
    console.log(`user : ${emailId} joined room :${roomId}`);
    // console.log(emailToSocketMap);
  });

  socket.on("call-user", (data) => {
    const { from_user, to_user, offer } = data;
    const dest_sid = emailToSocketMap.get(to_user);
    socket.to(dest_sid).emit("incoming-call", { from_user, offer });
  });

  socket.on("call-accepted", (data) => {
    const { from_user, answer } = data;
    const dest_sid = emailToSocketMap.get(from_user);
    socket.to(dest_sid).emit("call-accepted", { answer });
  });

  socket.on("nego-needed", (data) => {
    const { from_user, to_user, offer } = data;
    const dest_sid = emailToSocketMap.get(to_user);
    io.to(dest_sid).emit("nego-needed", { from_user, offer });
  });

  socket.on("nego-accepted", (data) => {
    const { to_user, answer } = data;
    const dest_sid = emailToSocketMap.get(to_user);
    io.to(dest_sid).emit("nego-final", { answer });
  });
});

io.listen(3000);
app.listen(port, () => console.log(`connected to port ${port}`));
