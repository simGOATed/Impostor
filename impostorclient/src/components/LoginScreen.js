import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from './animations';

const LoginScreen = ({ isCreate, onBack, onSubmit, onNameChange, onRoomChange, room }) => {
  return (
    <motion.div
      key="login"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div 
        className="text-left cursor-pointer mb-6 text-among-white opacity-75 hover:opacity-100 transition-opacity duration-200"
        onClick={onBack}
      >
        &larr; Back
      </div>
      <h1 className="text-4xl font-bold mb-6 text-among-white">{isCreate ? 'Create' : 'Join'} Room</h1>
      <div className="space-y-4">
        <motion.input
          type="text"
          placeholder="Name..."
          maxLength={20}
          className="among-input"
          onChange={onNameChange}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        />
        <motion.input
          type="text"
          placeholder="Room..."
          value={room}
          maxLength={5}
          className="among-input"
          onChange={onRoomChange}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        />
        <motion.button 
          className="among-button-red w-full"
          onClick={onSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter Room
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LoginScreen; 