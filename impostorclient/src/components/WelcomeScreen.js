import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './animations';
import ActiveRooms from './ActiveRooms';

const WelcomeScreen = ({ onCreateRoom, onJoinRoom, activeRooms, onJoinActiveRoom }) => {
  return (
    <motion.div
      key="welcome"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-5xl font-bold mb-6 text-among-red text-center">Who's the Impostor?</h1>
      <p className="text-xl mb-8 text-among-white">Welcome to the game! Create a room to start a new game or join an existing room.</p>
      
      <ActiveRooms rooms={activeRooms} onJoinRoom={onJoinActiveRoom} />
      
      <div className="space-y-4">
        <motion.button 
          className="among-button-green w-full"
          onClick={onCreateRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Room
        </motion.button>
        <motion.button 
          className="among-button-red w-full"
          onClick={onJoinRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Room Manually
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen; 