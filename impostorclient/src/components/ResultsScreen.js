import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './animations';

const ResultsScreen = ({ message, roundResults, user, creator, onStartRound, onExitRoom }) => {
  return (
    <motion.div
      key="results"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold mb-6 text-among-white">{message}</h1>
      {roundResults && (
        <div className="space-y-4 mb-6">
          <motion.div 
            className="among-card"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-among-cyan">Round Results</h2>
            <p className="text-among-white">
              {roundResults.votedOut 
                ? `${roundResults.votedOut} was voted out!`
                : "No one was voted out (tie)"}
            </p>
            <p className="text-among-white mt-2">
              {roundResults.impostorCaught 
                ? "The crew wins! (+1 point each)"
                : "The impostor wins! (+2 points)"}
            </p>
          </motion.div>
          <motion.div 
            className="among-card"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-among-yellow">Scores</h2>
            <div className="space-y-2">
              {Object.entries(roundResults.scores)
                .sort(([,a], [,b]) => b - a)
                .map(([player, score], index) => (
                  <motion.p 
                    key={player} 
                    className="text-lg text-among-white flex justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                  >
                    <span>{player}</span>
                    <span className="text-among-cyan">{score}</span>
                  </motion.p>
                ))}
            </div>
          </motion.div>
        </div>
      )}
      <div className="space-y-4">
        {user === creator && (
          <motion.button 
            className="among-button-green w-full"
            onClick={onStartRound}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Next Round
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

export default ResultsScreen; 