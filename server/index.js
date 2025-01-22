const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    pingTimeout: 60000, // Default is 60000ms (60 seconds)
    pingInterval: 25000, // Default is 25000ms (25 seconds),
    credentials: true
  }
});

let lobby = [];
let gameTimer = 6;
let interval = null;

let players = [];
let roundNumber = 0;
let roundTimer = 0;
let roundInterval = null;
let isRoundTimerPaused = false;
let gameSettings = {};
let gameStarted = false;

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  io.emit('lobby-updated', lobby);

  // Add to lobby
  socket.on('join-lobby', (playerName) => {
    console.log(`${playerName} joined the lobby`);
    lobby.push({ id: socket.id, name: playerName });
    
    io.emit('lobby-updated', lobby);
  });

  // Leave Lobby
  socket.on('leave-lobby', (playerName) => {
    console.log(`${playerName} left the lobby`);
    const index = lobby.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      lobby.splice(index, 1);
      io.emit('lobby-updated', lobby);
    }
  });

  // Reconnect player
  socket.on('reconnect-player', (playerName) => {
    const player = lobby.find((player) => player.name === playerName);
    if (player) {
      player.id = socket.id;
      io.emit('lobby-updated', lobby);
      if (gameStarted) {
        const playerData = players.find(p => p.name === playerName);
        if (playerData) {
          socket.emit('role-assigned', playerData.role);
          if (playerData.role === 'murderer') {
            const murderers = players.filter(p => p.role === 'murderer').map(p => p.name);
            socket.emit('murderers-info', murderers.filter(name => name !== playerName));
          }
          socket.emit('ready-page');
        }
      } else {
        socket.emit('ready-page');
      }
    }
  });

  // Start game and timer
  socket.on('start-countdown', (settings) => {
    gameSettings = settings;
    console.log(`Game Started! Game Settings: ${JSON.stringify(gameSettings)}`);
    gameTimer = 6; // Use the time from settings
    interval = setInterval(() => {
      gameTimer--;
      io.emit('timer-updated', gameTimer);
      if (gameTimer < 0) {
        clearInterval(interval);
        gameTimer = 0;
        gameStarted = true;
        initalizeGame();
        return;
      }
    }, 1000);
  });

  // Handle round timer
  socket.on('pause-round-timer', () => {
    isRoundTimerPaused = !isRoundTimerPaused;
  });

  socket.on('end-round-timer', () => {
    clearInterval(roundInterval);
    roundTimer = 0;
    io.emit('round-updated', roundTimer);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // const index = lobby.findIndex((player) => player.id === socket.id);
    // if (index !== -1) {
    //   lobby.splice(index, 1);
    //   io.emit('lobby-updated', lobby);
    // }
  });

  // Timer over event
  socket.on('timer-start', () => {
    console.log(`Timer Started!`);
    roundTimer = gameSettings.time; // Use the time from settings
    roundInterval = setInterval(() => {
      if (!isRoundTimerPaused) {
        roundTimer--;
        io.emit('round-updated', roundTimer);
        if (roundTimer < 0) {
          clearInterval(roundInterval);
          roundTimer = 0;
          io.emit('round-over');
          return;
        }
      }
    }, 1000);
  });

  // Handle ready page
  socket.on('ready-page', () => {
    io.emit('ready-page');
  });

  socket.on('ready', () => {
    io.emit('round-start');
  });

});

const initalizeGame = () => {
  let roles = [];
  for (let i = 0; i < gameSettings.numberOfMurderers; i++) {
    roles.push("murderer");
  }
  for (let i = 0; i < gameSettings.numberOfSheriffs; i++) {
    roles.push("sheriff");
  }
  if (gameSettings.jester) {
    roles.push("jester");
  }
  while (roles.length < lobby.length) {
    roles.push("civilian");
  }

  // Shuffle roles array
  roles = roles.sort(() => Math.random() - 0.5);

  for (let i = 0; i < lobby.length; i++) {
    const playerObject = { name: lobby[i].name, id : lobby[i].id, role: roles[i], alive: true };
    players.push(playerObject);
    io.to(lobby[i].id).emit('role-assigned', roles[i]);
  }

  // Send information about other murderers to each murderer
  const murderers = players.filter(player => player.role === 'murderer').map(player => player.name);
  players.forEach(player => {
    if (player.role === 'murderer') {
      io.to(player.id).emit('murderers-info', murderers.filter(name => name !== player.name));
    }
  });

  console.log(players);
  io.emit('ready-page');
};

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
