require('dotenv').config()

const express = require("express");
const app = express();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Link Socket.IO to the Express server
const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", 
                `http://localhost:${PORT}`
              ], // Allow multiple origins
      methods: ["GET", "POST"], // Allowed HTTP methods
    },
  });
  

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = "Generate a word or short phrase (3 words or less) for a game. Make sure that most average people know the word or phrase. The word should be a pop culture reference, famous people like celebrities, politicians or athletes, or well-known landmarks, restaurants, popular games, and other non-person pop culture references. Reply with just the word/phrase. Don't hide the word/phrase. If it's a person make sure you use their full name, not initials. Don't repeat words you've used already. The words you've used so far are:";
let usedWords = '';
const roomData = {}; 

const startRound = async(room) => {
    
    const result = await model.generateContent(prompt + usedWords);
    const word = result.response.text();
    usedWords = usedWords + word + " "
    console.log('Used words', usedWords);

    const users = roomData[room].users;
    
    const impostorIndex = Math.floor(Math.random() * users.length);
    
    roomData[room].word = word;
    roomData[room].impostor = users[impostorIndex];

    io.to(room).emit('round_started', roomData[room]);

    console.log(`Round started in room ${room}. Word: ${word}, Impostor: ${roomData[room].impostor}`);
};

const endRound = (room, impostor) => {
    io.to(room).emit('round_ended', impostor);
    console.log('Emitted');
    roomData[room].word = "";
    roomData[room].impostor = "";

    
}

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('create_room', (data, callback) => {
        const { room, user } = data;
        console.log('creating new room')

        if (!roomData[room]) {
            socket.join(room);
            roomData[room] = { users: [], word: '', impostor: '', creator: user };
            roomData[room].users.push(user);
            
            io.to(room).emit('room_data', roomData[room]);
            console.log(`User ${user} created room ${room}`);
            callback(true);
        } else {
            console.log(`Error: Room ${room} already exists`);
            callback(false);
        }
        
    });

    socket.on('join_room', (data, callback) => {
        const { room, user } = data;

        if (roomData[room]) {
            if (!roomData[room].users.includes(user)) {
                socket.join(room);
                roomData[room].users.push(user);
                io.to(room).emit('room_data', roomData[room]);
                
                console.log(`User ${user} joined room ${room}`);
                callback(true);
            } else {
                console.log(`Error: User ${user} is already in room ${room}`);
                callback(false);
            }
        } else {
            console.log(`Error: Room ${room} does not exist`);
            callback(false);
        }
    });

    socket.on('leave_room', (data, callback) => {
        const { room, user } = data;

        if (!roomData[room]) {
            console.log(`Error: Room ${room} does not exist`);
            return callback(false);
        }

        socket.leave(room);
        roomData[room].users = roomData[room].users.filter(u => u !== user);

        if (roomData[room].creator === user && roomData[room].users.length > 0) {
            roomData[room].creator = roomData[room].users[0]; // Assign new creator
            console.log(`New creator for room ${room}: ${roomData[room].creator}`);
        }

        io.to(room).emit('room_data', roomData[room]);

        console.log(`User ${user} left room ${room}`);
        console.log('roomData:')
        console.log(roomData);

        if (roomData[room].users.length === 0) {
            delete roomData[room];
            console.log(`Room ${room} deleted as it is empty.`);
        }

        callback(true);
    });

    socket.on('start_round', ({room, user}, callback) => {
        if (roomData[room] && roomData[room].creator === user) {
            if(roomData[room].users.length < 2){
                console.log(`Not enough players in room ${room} to start a round.`)
                callback(false);
            }
            else{
                startRound(room);
                callback(true);
            }
            
        } else {
            console.log(`Error: Only the room creator can start a round in room ${room}`);
            callback(false);
        }
    });

    socket.on('end_round', ({room, user}, callback) => {
        if (roomData[room] && roomData[room].creator === user) {
            const impostor = roomData[room].impostor || 'Unknown';
            endRound(room, impostor);
            console.log(`Round ended in room ${room}. Impostor: ${impostor}`);
            
            // startRound(room);
            callback(true);
        } else {
            console.log(`Error: Only the room creator can end the round in ${room}`);
            callback(false);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
