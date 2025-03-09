import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
let socket;

// Replace this with your own server URL
const CONNECTION_PORT = 'https://localhost:3001';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState('');
  const [user, setUser] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [impostor, setImpostor] = useState('');
  const [word, setWord] = useState('');
  const [message, setMessage] = useState('');
  const [creator, setCreator] = useState('');
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);

  useEffect(() => {
    socket = io(CONNECTION_PORT);

    socket.on('room_data', (roomdata) => {
      console.log('roomdata', roomdata);
      setRoomUsers(roomdata['users']);
      setCreator(roomdata['creator']);
    });

    socket.on('round_started', (roomData) => {
      setImpostor(roomData.impostor);
      setWord(roomData.word);
      setRoundStarted(true);
      setRoundFinished(false);
    });

    socket.on('round_ended', (impostor) => {
      console.log('round_ended!')
      setMessage(`Round ended! The impostor was: ${impostor}`);
      setImpostor('');

      setWord('');
      setRoundStarted(false);
      setRoundFinished(true);
      
    });

    return () => {
      socket.disconnect();
      socket.off('users_in_room');
      socket.off('role_assigned');
      socket.off('round_ended');
    };
  }, []);

  useEffect(() => {
    if (impostor){
      if (user === impostor){
        setMessage('You are the impostor!');
      }
      else{
        setMessage(`The word is ${word}`)
      }
    }    
  }, [impostor]);

  const connectToRoom = () => {
    if (user && room) {
      console.log('User', user);
      socket.emit(`${create ? 'create' : 'join'}_room`, { room, user }, (success) => {
        if (success) {
          setLoggedIn(true);
          console.log(room)
        } else {
          alert(`Failed to ${create ? 'create' : 'join'} room`);
        }
      });
    }
  };

  const exitFromRoom = () => {
    socket.emit('leave_room', { room, user }, success => {
      if (success) {
        setUser('');
        setRoom('');
        setLoggedIn(false);
        setImpostor('');
        setMessage('');
        setRoundStarted(false);
        setRoundFinished(false);
      }
    });
  };

  const startRound = () => {
    socket.emit('start_round', { room, user }, (success) => {
      console.log(success);
      if (success) {
        console.log('Round started');
      } else {
        alert('Error: Could not start round');
      }
    });
  };

  const endRound = () => {
    socket.emit('end_round', { room, user }, (success) => {
      if (success) {
        console.log('Round ended');
      } else {
        alert('Only the room creator can end the round');
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="content">
          {!loggedIn ? (
            !create && !join ? (
              <>
                <h1>Who's the Impostor?</h1>
                <p>Welcome to the game! Create a room to start a new game or join an existing room.</p>
                <div className="button-container">
                  <button className="game-button create" onClick={() => setCreate(true)}>Create Room</button>
                  <button className="game-button join" onClick={() => setJoin(true)}>Join Room</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: "left", cursor: "pointer" }} onClick={() => { setCreate(false); setJoin(false); }}>
                  &larr; Back
                </div>
                <h1>{create ? 'Create' : 'Join'} Room</h1>
                <div className="button-container">
                  <input
                    type="text"
                    placeholder="Name..."
                    maxLength={20}
                    onChange={(e) => setUser(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Room..."
                    value={room}
                    maxLength={5}
                    onChange={(e) => setRoom(e.target.value.replace(/\D/, ''))}
                  />
                  <button className="game-button" onClick={connectToRoom}>Enter Room</button>
                </div>
              </>
            )
          ) : (
            console.log('round started', roundStarted),
            !roundStarted && !roundFinished ? (
              <>
                <h1>{user}, You are in room: {room}</h1>
                {/* <p>{message}</p> */}
                <div>
                  <p>Users in this room:</p>
                  {roomUsers.map((u, index) => (
                    <p key={index}>{u} {u === creator ? "(Creator)" : ""}</p>
                  ))}
                </div>
                {user === creator && (
                  <div>
                    <button onClick={startRound}>Start Round</button>
                  </div>
                )}
                <button onClick={exitFromRoom}>Leave Room</button>
              </>
            ) : (
              roundStarted ? (
                <>
                  <h1>{message}</h1>
                  {user === creator && (
                    <div>
                      <button onClick={endRound}>End Round</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h1>{message}</h1>
                  {user === creator && <button onClick={startRound}>Start Round</button>}
                  <button onClick={exitFromRoom}>Leave Room</button>
                </>
              )
            )
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
