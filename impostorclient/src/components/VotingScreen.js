import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition, listItemAnimation } from './animations';

const VotingScreen = ({ hasVoted, roomUsers, user, onVote, voteCount, totalVotesNeeded }) => {
  return (
    <motion.div
      key="voting"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-among-red mb-8">Time to Vote!</h1>
      {!hasVoted ? (
        <>
          <h2 className="text-2xl font-bold text-among-white mb-4">Who is the Impostor?</h2>
          <div className="space-y-3">
            {roomUsers.filter(u => u !== user).map((playerName, index) => (
              <motion.button
                key={playerName}
                className="among-button-red w-full py-4 text-lg flex items-center justify-between px-6"
                onClick={() => onVote(playerName)}
                variants={listItemAnimation}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: index * 0.1 }}
              >
                <span>{playerName}</span>
                <motion.span 
                  className="text-among-white opacity-50"
                  whileHover={{ opacity: 1 }}
                >
                  Vote
                </motion.span>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-among-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl mb-4"
          >
            Vote submitted!
          </motion.div>
          <motion.div 
            className="text-lg opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>Waiting for other players...</p>
            <div className="mt-4 flex justify-center items-center space-x-2">
              <div className="h-2 bg-among-red rounded-full" style={{ width: `${(voteCount / totalVotesNeeded) * 100}%` }} />
              <span>({voteCount}/{totalVotesNeeded})</span>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default VotingScreen; 