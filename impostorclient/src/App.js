import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';

let socket;

// Replace this with your own server URL
const CONNECTION_PORT = 'http://localhost:3001';

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState('');
  const [user, setUser] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [impostor, setImpostor] = useState('');
  const [word, setWord] = useState('');
  const [wordCategory, setWordCategory] = useState('');
  const [message, setMessage] = useState('');
  const [creator, setCreator] = useState('');
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const [turnOrder, setTurnOrder] = useState([]);
  const [readyToVote, setReadyToVote] = useState(false);
  const [votingPhase, setVotingPhase] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [requiredVotes, setRequiredVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [totalVotesNeeded, setTotalVotesNeeded] = useState(0);
  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [gamePhase, setGamePhase] = useState('lobby'); // 'lobby', 'word', 'voting', 'results'
  const [activeRooms, setActiveRooms] = useState({});

  useEffect(() => {
    socket = io(CONNECTION_PORT);

    socket.on('room_data', (roomdata) => {
      console.log('roomdata', roomdata);
      setRoomUsers(roomdata['users']);
      setCreator(roomdata['creator']);
      setScores(roomdata.scores || {});
      setGamePhase('lobby');
    });

    socket.on('round_started', (roomData) => {
      setImpostor(roomData.impostor);
      setWord(roomData.word);
      setWordCategory(roomData.category || '');
      setRoundStarted(true);
      setRoundFinished(false);
      setTurnOrder(roomData.turnOrder);
      setReadyToVote(false);
      setVotingPhase(false);
      setHasVoted(false);
      setRoundResults(null);
      setGamePhase('word');
    });

    socket.on('vote_ready_update', (data) => {
      setReadyPlayers(data.readyPlayers);
      setRequiredVotes(data.requiredCount);
    });

    socket.on('start_voting', () => {
      setVotingPhase(true);
      setGamePhase('voting');
    });

    socket.on('vote_update', (data) => {
      setVoteCount(data.voteCount);
      setTotalVotesNeeded(data.totalPlayers);
    });

    socket.on('round_ended', (data) => {
      setRoundResults(data);
      setScores(data.scores);
      setMessage(`Round ended! The impostor was: ${data.impostor}`);
      setImpostor('');
      setWord('');
      setWordCategory('');
      setRoundStarted(false);
      setRoundFinished(true);
      setTurnOrder([]);
      setVotingPhase(false);
      setReadyToVote(false);
      setHasVoted(false);
      setGamePhase('results');
    });

    socket.on('active_rooms_update', (rooms) => {
      setActiveRooms(rooms);
    });

    return () => {
      if (loggedIn && room && user) {
        socket.emit('leave_room', { room, user });
      }
      socket.disconnect();
      socket.off('users_in_room');
      socket.off('role_assigned');
      socket.off('round_ended');
      socket.off('vote_ready_update');
      socket.off('start_voting');
      socket.off('vote_update');
      socket.off('active_rooms_update');
    };
  }, []);

  useEffect(() => {
    if (impostor){
      if (user === impostor){
        setMessage(`You are the impostor! The word is in the category: ${wordCategory}`);
      }
      else{
        setMessage(`The word is: ${word}`)
      }
    }    
  }, [impostor, wordCategory]);

  // Add a new useEffect to handle window unload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (loggedIn && room && user) {
        socket.emit('leave_room', { room, user });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loggedIn, room, user]);

  const connectToRoom = () => {
    if (user.trim() && room) {
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

  const handleReadyToVote = () => {
    socket.emit('ready_to_vote', { room, user }, (success) => {
      if (success) {
        setReadyToVote(true);
      }
    });
  };

  const handleVote = (votedFor) => {
    socket.emit('submit_vote', { room, user, votedFor }, (success) => {
      if (success) {
        setHasVoted(true);
      }
    });
  };

  const handleJoinActiveRoom = (roomId) => {
    setRoom(roomId);
    setJoin(true);
  };

  return (
    <div className="min-h-screen among-us-bg">
      <div className="content-wrapper container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto among-card">
          <AnimatePresence mode="wait">
            {!loggedIn ? (
              !create && !join ? (
                <WelcomeScreen
                  onCreateRoom={() => setCreate(true)}
                  onJoinRoom={() => setJoin(true)}
                  activeRooms={activeRooms}
                  onJoinActiveRoom={handleJoinActiveRoom}
                />
              ) : (
                <LoginScreen
                  isCreate={create}
                  onBack={() => { setCreate(false); setJoin(false); }}
                  onSubmit={connectToRoom}
                  onNameChange={(e) => setUser(e.target.value)}
                  onRoomChange={(e) => setRoom(e.target.value.replace(/\D/, ''))}
                  room={room}
                />
              )
            ) : (
              gamePhase === 'lobby' ? (
                <LobbyScreen
                  user={user}
                  room={room}
                  roomUsers={roomUsers}
                  creator={creator}
                  scores={scores}
                  onStartRound={startRound}
                  onExitRoom={exitFromRoom}
                />
              ) : gamePhase === 'word' ? (
                <GameScreen
                  message={message}
                  turnOrder={turnOrder}
                  user={user}
                  impostor={impostor}
                  readyToVote={readyToVote}
                  onReadyToVote={handleReadyToVote}
                  readyPlayers={readyPlayers}
                  requiredVotes={requiredVotes}
                />
              ) : gamePhase === 'voting' ? (
                <VotingScreen
                  hasVoted={hasVoted}
                  roomUsers={roomUsers}
                  user={user}
                  onVote={handleVote}
                  voteCount={voteCount}
                  totalVotesNeeded={totalVotesNeeded}
                />
              ) : (
                <ResultsScreen
                  message={message}
                  roundResults={roundResults}
                  user={user}
                  creator={creator}
                  onStartRound={startRound}
                  onExitRoom={exitFromRoom}
                />
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
