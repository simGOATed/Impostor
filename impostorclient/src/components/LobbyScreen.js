import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition, listItemAnimation } from './animations';

const LobbyScreen = ({ user, room, roomUsers, creator, scores, onStartRound, onExitRoom }) => {
  return (
    <motion.div
      key="lobby"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold mb-6 text-among-white">{user}, You are in room: {room}</h1>
      <div className="mb-8">
        <p className="text-xl mb-4 text-among-cyan">Users in this room:</p>
        <div className="space-y-2">
          {roomUsers.map((u, index) => (
            <motion.p 
              key={index} 
              className="text-lg text-among-white flex justify-between items-center"
              variants={listItemAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <span>{u} {u === creator && <span className="text-among-yellow">(Creator)</span>}</span>
              <span className="text-among-cyan">Score: {scores[u] || 0}</span>
            </motion.p>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {user === creator && (
          <motion.button 
            className="among-button-green w-full"
            onClick={onStartRound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Round
          </motion.button>
        )}
        <motion.button 
          className="among-button-red w-full"
          onClick={onExitRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Leave Room
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LobbyScreen; 