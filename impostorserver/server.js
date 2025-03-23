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
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
const prompt = "Generate a word or short phrase (3 words or less) for a game, along with its category. Make sure that most average people know the word or phrase. The word should be a pop culture reference, famous people like celebrities, politicians, youtubers, athletes or other famous people, or well-known TV shows, movies, popular games, landmarks, brandsand other non-person pop culture references. Don't make the word something that only Americas would know. Reply in JSON format like this: {\"word\": \"your word here\", \"category\": \"category here\"}. Categories should be one of: Celebrity, Athlete, Entertainment, Landmark, Brand, or Miscellaneous. Don't repeat words you've used already. The words you've used so far are:";
let usedWords = '';
const roomData = {}; 

// Helper function to calculate required votes
const getRequiredVotesCount = (totalPlayers) => {
    return totalPlayers - (1 + Math.floor(totalPlayers / 7));
};

const startRound = async(room) => {
    try {
        const result = await model.generateContent(
        {contents: {
            role: 'user',
            parts: [
              {
                text: prompt + usedWords,
              }
            ],
          }, 
          generationConfig: {temperature: 2}
        });
        const response = result.response.text();
        console.log('response', response);
        let word, category;
        
        try {
            // Clean up the response by removing markdown code block formatting
            const cleanResponse = response.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleanResponse);
            word = parsed.word;
            category = parsed.category;
        } catch (e) {
            // If JSON parsing fails, use the whole response as the word and set default category
            console.error('JSON parsing error:', e);
            word = response.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
            category = 'miscellaneous';
        }

        usedWords = usedWords + word + " ";
        console.log('Used words', usedWords);

        const users = roomData[room].users;
        let impostorIndex;
        
        // If there was a previous impostor, implement 5% chance rule
        if (roomData[room].previousImpostor) {
            const previousImpostorIndex = users.indexOf(roomData[room].previousImpostor);
            const random = Math.random();
            if (random > 0.05) { // 95% chance to pick someone else
                // Create array of indices excluding previous impostor
                const availableIndices = users.map((_, index) => index)
                    .filter(index => index !== previousImpostorIndex);
                impostorIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            } else { // 5% chance to pick the same person
                impostorIndex = previousImpostorIndex;
            }
        } else {
            impostorIndex = Math.floor(Math.random() * users.length);
        }
        
        // Shuffle the users array to create random turn order
        const shuffledUsers = [...users];
        for (let i = shuffledUsers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
        }
        
        roomData[room].word = word;
        roomData[room].category = category;
        roomData[room].impostor = users[impostorIndex];
        roomData[room].previousImpostor = users[impostorIndex];
        roomData[room].turnOrder = shuffledUsers;
        roomData[room].readyToVote = new Set();
        roomData[room].votes = new Map();
        roomData[room].scores = roomData[room].scores || new Map();
        
        // Initialize scores for new players
        users.forEach(user => {
            if (!roomData[room].scores.has(user)) {
                roomData[room].scores.set(user, 0);
            }
        });

        // Get all socket IDs in the room
        const socketsInRoom = await io.in(room).allSockets();
        const impostorSocket = Array.from(socketsInRoom).find(
            socketId => io.sockets.sockets.get(socketId).data.user === roomData[room].impostor
        );
        
        if (impostorSocket) {
            io.to(impostorSocket).emit('round_started', {
                ...roomData[room],
                wordCategory: category,
                scores: Object.fromEntries(roomData[room].scores)
            });
        }

        // Send normal data to other players
        io.to(room).emit('round_started', {
            ...roomData[room],
            scores: Object.fromEntries(roomData[room].scores)
        });

        console.log(`Round started in room ${room}. Word: ${word}, Impostor: ${roomData[room].impostor}, Turn Order: ${shuffledUsers.join(', ')}`);
    } catch (e) {
        console.error('Error in startRound:', e);
    }
};

const endRound = (room, impostor) => {
    // Calculate votes
    const voteCount = new Map();
    roomData[room].votes.forEach((votedFor) => {
        voteCount.set(votedFor, (voteCount.get(votedFor) || 0) + 1);
    });

    // Find the player(s) with most votes
    let maxVotes = 0;
    let votedOut = [];
    voteCount.forEach((count, player) => {
        if (count > maxVotes) {
            maxVotes = count;
            votedOut = [player];
        } else if (count === maxVotes) {
            votedOut.push(player);
        }
    });

    // Determine if impostor was caught
    const impostorCaught = votedOut.length === 1 && votedOut[0] === roomData[room].impostor;

    // Update scores
    if (impostorCaught) {
        // Everyone except impostor gets a point
        roomData[room].users.forEach(user => {
            if (user !== roomData[room].impostor) {
                roomData[room].scores.set(user, (roomData[room].scores.get(user) || 0) + 1);
            }
        });
    } else {
        // Impostor gets 2 points
        roomData[room].scores.set(
            roomData[room].impostor, 
            (roomData[room].scores.get(roomData[room].impostor) || 0) + 2
        );
    }

    // Send round results
    io.to(room).emit('round_ended', {
        impostor: roomData[room].impostor,
        votes: Object.fromEntries(roomData[room].votes),
        votedOut: votedOut.length === 1 ? votedOut[0] : null,
        impostorCaught,
        scores: Object.fromEntries(roomData[room].scores)
    });

    // Reset round data
    roomData[room].word = "";
    roomData[room].impostor = "";
    roomData[room].turnOrder = [];
    roomData[room].readyToVote = new Set();
    roomData[room].votes = new Map();

    console.log('roomData:')
    console.log(roomData);

    if (roomData[room].users.length === 0) {
        delete roomData[room];
        console.log(`Room ${room} deleted as it is empty.`);
    }
};

// Add a helper function to find a user's room
const findUserRoom = (socket) => {
  for (const [roomName, roomInfo] of Object.entries(roomData)) {
    if (roomInfo.users.includes(socket.data.user)) {
      return roomName;
    }
  }
  return null;
};

// Add a function to broadcast active rooms
const broadcastActiveRooms = () => {
    // Convert Map objects to plain objects for each room
    const roomsToSend = {};
    for (const [roomId, room] of Object.entries(roomData)) {
        roomsToSend[roomId] = {
            ...room,
            scores: Object.fromEntries(room.scores),
            readyToVote: Array.from(room.readyToVote),
            votes: Object.fromEntries(room.votes),
            users: room.users
        };
    }
    io.emit('active_rooms_update', roomsToSend);
};

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);
    
    // Send active rooms immediately on connection
    broadcastActiveRooms();

    socket.on('create_room', (data, callback) => {
        const { room, user } = data;
        console.log('creating new room')

        if (!roomData[room]) {
            socket.join(room);
            socket.data.user = user;
            socket.data.room = room;
            roomData[room] = { 
                users: [], 
                word: '', 
                impostor: '', 
                creator: user,
                scores: new Map(),
                readyToVote: new Set(),
                votes: new Map()
            };
            roomData[room].users.push(user);
            roomData[room].scores.set(user, 0);
            
            io.to(room).emit('room_data', {
                ...roomData[room],
                scores: Object.fromEntries(roomData[room].scores)
            });
            
            // Broadcast updated room list
            broadcastActiveRooms();
            
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
                socket.data.user = user;
                socket.data.room = room;
                roomData[room].users.push(user);
                
                if (!roomData[room].scores.has(user)) {
                    roomData[room].scores.set(user, 0);
                }

                io.to(room).emit('room_data', {
                    ...roomData[room],
                    scores: Object.fromEntries(roomData[room].scores)
                });
                
                // Broadcast updated room list
                broadcastActiveRooms();
                
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
            if (callback) callback(false);
            return;
        }

        socket.leave(room);
        roomData[room].users = roomData[room].users.filter(u => u !== user);

        if (roomData[room].creator === user && roomData[room].users.length > 0) {
            roomData[room].creator = roomData[room].users[0];
            console.log(`New creator for room ${room}: ${roomData[room].creator}`);
        }

        if (roomData[room].users.length > 0) {
            io.to(room).emit('room_data', {
                ...roomData[room],
                scores: Object.fromEntries(roomData[room].scores)
            });
        }

        // Broadcast updated room list
        broadcastActiveRooms();

        console.log(`User ${user} left room ${room}`);

        if (roomData[room].users.length === 0) {
            delete roomData[room];
            console.log(`Room ${room} deleted as it is empty.`);
        }

        if (callback) callback(true);
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

    socket.on('ready_to_vote', ({room, user}, callback) => {
        if (!roomData[room]) return callback(false);

        roomData[room].readyToVote.add(user);
        const requiredVotes = getRequiredVotesCount(roomData[room].users.length);
        
        // Notify all players about the ready status
        io.to(room).emit('vote_ready_update', {
            readyCount: roomData[room].readyToVote.size,
            requiredCount: requiredVotes,
            readyPlayers: Array.from(roomData[room].readyToVote)
        });

        // If enough players are ready, start voting phase
        if (roomData[room].readyToVote.size >= requiredVotes) {
            io.to(room).emit('start_voting');
        }

        callback(true);
    });

    socket.on('submit_vote', ({room, user, votedFor}, callback) => {
        if (!roomData[room]) return callback(false);

        roomData[room].votes.set(user, votedFor);
        
        // If everyone has voted, end the round
        if (roomData[room].votes.size === roomData[room].users.length) {
            endRound(room, roomData[room].impostor);
        } else {
            // Notify about vote progress
            io.to(room).emit('vote_update', {
                voteCount: roomData[room].votes.size,
                totalPlayers: roomData[room].users.length
            });
        }

        callback(true);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        const room = socket.data.room;
        const user = socket.data.user;
        
        if (room && user && roomData[room]) {
            roomData[room].users = roomData[room].users.filter(u => u !== user);

            if (roomData[room].creator === user && roomData[room].users.length > 0) {
                roomData[room].creator = roomData[room].users[0];
                console.log(`New creator for room ${room}: ${roomData[room].creator}`);
            }

            if (roomData[room].users.length > 0) {
                io.to(room).emit('room_data', {
                    ...roomData[room],
                    scores: Object.fromEntries(roomData[room].scores)
                });

                if (roomData[room].word) {
                    const impostor = roomData[room].impostor;
                    endRound(room, impostor);
                }
            } else {
                delete roomData[room];
                console.log(`Room ${room} deleted as it is empty.`);
            }

            // Broadcast updated room list
            broadcastActiveRooms();
        }
    });
});
