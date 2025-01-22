import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import "./App.css";

import Homepage from './components/Homepage';
import Lobby from './components/Lobby';
import ReadyPage from './components/ReadyPage';
import RoundTimer from './components/RoundTimer';
import ErrorPage from './components/ErrorPage';

// Function to detect if the client is on a mobile device
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Set the socket URL based on the device type
let socket;

if (isMobileDevice()) {
  console.log('Mobile device detected');
}

//CAHNGE!!!!!
socket = io('http://192.168.1.93:4000', { transports : ['websocket'] });

function App() {
  
  const [playerName, setPlayerName] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [lobby, setLobby] = useState([]);
  const [timer, setTimer] = useState(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [showReadyButton, setShowReadyButton] = useState(false);
  
  const [roundTimer, setRoundTimer] = useState(null);
  const [showRoundTimer, setShowRoundTimer] = useState(false);
  const [showReadyPage, setShowReadyPage] = useState(false);
  const [showHomepage, setShowHomepage] = useState(true);
  const [showLobby, setShowLobby] = useState(false);
  const [showErrorPage, setShowErrorPage] = useState(false);

  const [gameState, setGameState] = useState({ screen: 'lobby', round: 0 });

  // Game settings
  const [gameSettings, setGameSettings] = useState({
    time: 360,
    numberOfMurderers: 1,
    numberOfSheriffs: 1,
    jester: false
  });

  const [playerRole, setPlayerRole] = useState("");
  const [otherMurderers, setOtherMurderers] = useState([]);

  useEffect(() => {
    socket.on('lobby-updated', (lobby) => setLobby(lobby));
    socket.on('timer-updated', (time) => {
      setTimer(time);
      if (time === 0) {
        setShowReadyPage(true);
      }
    });
    socket.on('round-start', handleRoundStart);
    socket.on('round-updated', (time) => setRoundTimer(time));
    socket.on('ready-page', handleReadyPage);
    socket.on('role-assigned', (role) => setPlayerRole(role));
    socket.on('murderers-info', (murderers) => setOtherMurderers(murderers));
    socket.on('start-page', () => setShowHomepage(true));
    socket.on('error-page', () => setShowErrorPage(true));
    
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
      socket.emit('reconnect-player', storedPlayerName);
    }
  }, []);
  

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    // Emit the player's name to the server.
    setIsConnected(true);
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerName) {
      socket.emit('reconnect-player', storedPlayerName);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    setIsConnected(false);
  });

  const handleStart = () => {
    setShowHomepage(false);
    setShowLobby(true);
  };

  // Lobby-related functions
  const joinLobby = () => {
    console.log(lobby);
    if (!playerName) {
      alert("Please enter your name!");
      return;
    }
    if(lobby.findIndex((player) => player.id === socket.id) !== -1){
      alert("You are already in the lobby");
      return;
    }
    if(lobby.findIndex((player) => player.name === playerName) !== -1){
      alert("Name already taken");
      return;
    }
    
    //console.log('Joining lobby:', playerName);
    localStorage.setItem('playerName', playerName);
    socket.emit('join-lobby', playerName);
  };

  const leaveLobby = () => {
    if(lobby.findIndex((player) => player.id === socket.id) === -1){
      alert("You are not in the lobby");
      return;
    }
    localStorage.removeItem('playerName');
    socket.emit('leave-lobby', playerName);
  };

  const startCountdown = () => {
    if (lobby.length === 0) {
      alert("Cannot start game with no players");
      return;
    }
    if((parseInt(gameSettings.numberOfMurderers) + parseInt(gameSettings.numberOfSheriffs) + (gameSettings.jester ? 1 : 0)) > lobby.length){
      alert("Not enough players for the selected roles");
      return;
    }
    socket.emit('start-countdown', gameSettings);
  };

  const handleGameSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGameSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReadyPage = () => {
    setGameState({ screen: 'ready', round: "1" });
    const player = lobby.find(p => p.name === playerName);
    if (player) {
      setPlayerRole(player.role);
      
    }
    setShowReadyPage(true);
  };


  function useBodyClass(className) {
    useEffect(() => {
      const body = document.body;
  
      // Add the class to the body
      body.classList.add(className);
  
      // Cleanup: Remove the class on unmount
      return () => {
        body.classList.remove(className);
      };
    }, [className]);
  }

  const handleReady = () => {
    setShowReadyPage(false);
    handleRoundStart();
  };
  
  const toggleFlip = () => {
    setIsFlipped((prevState) => !prevState);
    if (!showReadyButton) {
      setShowReadyButton(true);
    }
  }

  // Round-related functions
  const handleRoundStart = () => {
    setShowReadyPage(true);
  };

  const pauseRoundTimer = () => {
    socket.emit('pause-round-timer');
  };

  const endRoundTimer = () => {
    socket.emit('end-round-timer');
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case 'murderer':
        return {image: 'murdercard.jpg', text: `The other murderer(s) are: ${otherMurderers}`, color: "#d2232a"};
      case 'sheriff':
        return {image: 'sheriffcard.jpg', text: 'Find out the murder', color: "#0087ba"};
      case 'jester':
        return {image: 'jestercard.jpg', text: 'deceive others to vote you out', color: "#009d4a"};
      case 'civilian':
        return {image: 'civcard.jpg', text: 'Survive the night', color: "#ffffff"};
      default:
        return{image: 'nik.jpg', text: "Game has started and you didn't join, or theres a bug"}
    }
  };

  useBodyClass(showReadyPage ? "no-background" : "with-background");


  if(showErrorPage){
    return(
      <ErrorPage/>
    );
  }

  if (showReadyPage) {
    return (
      <ReadyPage
        isFlipped={isFlipped}
        toggleFlip={toggleFlip}
        showReadyButton={showReadyButton}
        playerRole={playerRole}
        getRoleDetails={getRoleDetails}
      />
    );
  }

  if (showRoundTimer) {
    return (
      <RoundTimer
        roundTimer={roundTimer}
        pauseRoundTimer={pauseRoundTimer}
        endRoundTimer={endRoundTimer}
        lobby={lobby}
      />
    );
  }

  if (showLobby) {
    return (
      <Lobby
        lobby={lobby}
        gameSettings={gameSettings}
        playerName={playerName}
        isConnected={isConnected}
        timer={timer}
        joinLobby={joinLobby}
        leaveLobby={leaveLobby}
        startCountdown={startCountdown}
        handleGameSettingsChange={handleGameSettingsChange}
        setPlayerName={setPlayerName}
      />
    );
  }

  return <Homepage onStart={handleStart} />;
}

export default App;
