import React from 'react';
import { motion } from 'framer-motion';
import { listItemAnimation } from './animations';

const ActiveRooms = ({ rooms, onJoinRoom }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-among-cyan">Active Rooms:</h2>
      {Object.entries(rooms).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(rooms).map(([roomId, roomInfo], index) => (
            <motion.div
              key={roomId}
              className="among-card bg-opacity-50 hover:bg-opacity-75 transition-all cursor-pointer"
              onClick={() => onJoinRoom(roomId)}
              variants={listItemAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 10 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-among-white">Room: {roomId}</h3>
                  <p className="text-among-cyan mt-1">
                    Players: {roomInfo.users.join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-among-white opacity-75">
                    {roomInfo.users.length} / 10
                  </span>
                  <motion.button
                    className="among-button-green px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-among-white opacity-75">No active rooms. Create one to start playing!</p>
      )}
    </div>
  );
};

export default ActiveRooms; 