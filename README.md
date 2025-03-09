# Impostor Game

A real-time game where players join a room, and one is secretly assigned as "the Impostor." The game is built using a React front-end and an Express/Socket.IO back-end, with some AI integration to generate game words/phrases.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Applications](#running-the-applications)
  - [Front-End (impostorgame)](#front-end-impostorgame)
  - [Back-End (impostorserver)](#back-end-impostorserver)
- [How to Play](#how-to-play)
- [Technologies Used](#technologies-used)
- [Environment Variables](#environment-variables)
- [License](#license)

## Overview

The Impostor Game allows users to create or join game rooms and start a round. During a round, one player is randomly chosen as the Impostor, while the remaining players receive a word generated via a Google Generative AI model. Players must deduce who the Impostor is based on the word and game clues.

## Project Structure

```
Impostor
├── impostorgame/         # React front-end application
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── chat.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   └── package.json
└── impostorserver/       # Express/Socket.IO back-end application
    ├── server.js
    ├── .env
    └── package.json
```

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Steps

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Impostor
   ```

2. **Install front-end dependencies:**

   ```bash
   cd impostorgame
   npm install
   # or
   yarn install
   ```

3. **Install back-end dependencies:**

   ```bash
   cd ../impostorserver
   npm install
   # or
   yarn install
   ```

## Running the Applications

### Front-End (impostorgame)

1. Open a terminal window in the `impostorgame` folder.
2. Start the app with:

   ```bash
   npm start
   # or
   yarn start
   ```

   The app will run in development mode on [http://localhost:3000](http://localhost:3000).

### Back-End (impostorserver)

1. Open a separate terminal window in the `impostorserver` folder.
2. Create a `.env` file (if not already present) with the following content:

   ```env
   PORT = 3001
   GOOGLE_API_KEY = your-google-api-key
   ```

3. Start the server with:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The server will run on [http://localhost:3001](http://localhost:3001).

## How to Play

1. **Create or Join Room:**
   - On the front-end, choose to create a room or join an existing one by entering your name and room number.
2. **Start a Round:**
   - Only the room creator can start a round. During the round, a word is generated using a generative AI model and one user is randomly assigned as the Impostor.
3. **Gameplay:**
   - The non-Impostor players receive a clue (the generated word/phrase).
   - Use the on-screen controls to leave the room or end the round (if you are the creator).

## Technologies Used

- **Front-End:** React, Socket.IO-client, Create React App
- **Back-End:** Express, Socket.IO, Google Generative AI
- **Real-Time Communication:** Socket.IO

## Environment Variables

For the back-end, ensure you have a valid Google API key in the `.env` file:

```env
PORT = 3001
GOOGLE_API_KEY = your-google-api-key
```

## License

This project is licensed under the [MIT License](LICENSE).
