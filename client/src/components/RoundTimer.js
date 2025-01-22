import React from 'react';

const RoundTimer = ({ roundTimer, pauseRoundTimer, endRoundTimer, lobby }) => (
  <div style={{ textAlign: 'center' }}>
    <h1>Round Timer: {roundTimer}</h1>
    <button onClick={pauseRoundTimer}>Pause Timer</button>
    <button onClick={endRoundTimer}>End Timer</button>
    <h2>Lobby</h2>
    <ul>
      {lobby.map(player => (
        <li key={player.id}>{player.name}</li>
      ))}
      {lobby.length === 0 && <li>No players in the lobby</li>}
    </ul>
  </div>
);

export default RoundTimer;
