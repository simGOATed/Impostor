import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition, listItemAnimation } from './animations';

const GameScreen = ({ message, turnOrder, user, impostor, readyToVote, onReadyToVote, readyPlayers, requiredVotes }) => {
  return (
    <motion.div
      key="word"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold mb-6 text-among-white">{message}</h1>
      <div className="among-card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-among-cyan">Turn Order:</h2>
        <ol className="space-y-2">
          {turnOrder.map((playerName, index) => (
            <motion.li 
              key={index} 
              className={`p-3 rounded-lg transition-colors duration-200 ${
                playerName === user 
                  ? 'bg-among-green bg-opacity-25 text-among-lime' 
                  : 'text-among-white hover:bg-among-white hover:bg-opacity-10'
              }`}
              variants={listItemAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              {playerName} {playerName === impostor && user === impostor && 
                <span className="text-among-red">(You are the Impostor!)</span>
              }
            </motion.li>
          ))}
        </ol>
      </div>
      
      <div className="space-y-4">
        {!readyToVote && (
          <motion.button 
            className="among-button-green w-full"
            onClick={onReadyToVote}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ready to Vote
          </motion.button>
        )}
        {readyPlayers.length > 0 && (
          <motion.div 
            className="text-among-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>Players ready to vote: {readyPlayers.length}/{requiredVotes} required</p>
            <div className="text-sm opacity-75">
              {readyPlayers.join(', ')}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GameScreen; 