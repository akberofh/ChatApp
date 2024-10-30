import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Connection from './config/dbb.js'; 
import Chat from './models/Chat.js';


const app = express();
app.use(express.json());


Connection();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("connected");

    const loadMessages = async () => {
        try {
            const messages = await Chat.find().sort({timeStamp : 1}).exec();
            socket.emit('chat', messages);
        } catch(err) {
            console.log(err);
        }
    };
    loadMessages();

    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new Chat(msg);
            await newMessage.save();
            io.emit('message', msg);
        } catch(err) {
            console.log(err);
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnect");
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "Welcome",
    });
});

server.listen("3002", () => {
    console.log("running on 3002 port");
});
