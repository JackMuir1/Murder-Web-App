import React from 'react';

const Lobby = ({ playerName, setPlayerName, joinLobby, leaveLobby, gameSettings, handleGameSettingsChange, startCountdown, lobby, timer }) => (
  <div>
    <h1>Lobby</h1>

    <h2>{timer !== null ? "Game Starting:" : ""}{timer}</h2>
    <input
      type="text"
      placeholder="Enter your name"
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
    />
    <br />
    <button onClick={joinLobby}>Join Lobby</button>
    <button onClick={leaveLobby}>Leave Lobby</button>
    
    <h2>Game Settings</h2>
    <form>
      <label>
        Time:
        <input
          type="number"
          name="time"
          value={gameSettings.time}
          onChange={handleGameSettingsChange}
        />
      </label>
      <br />
      <label>
        Number of Murderers:
        <input
          type="number"
          name="numberOfMurderers"
          value={gameSettings.numberOfMurderers}
          onChange={handleGameSettingsChange}
        />
      </label>
      <br />
      <label>
        Number of Sheriffs:
        <input
          type="number"
          name="numberOfSheriffs"
          value={gameSettings.numberOfSheriffs}
          onChange={handleGameSettingsChange}
        />
      </label>
      <br />
      <label>
        Jester:
        <input
          type="checkbox"
          name="jester"
          checked={gameSettings.jester}
          onChange={handleGameSettingsChange}
        />
      </label>
    </form>
    <button onClick={startCountdown}>Start Game</button>
    
    <h2>Lobby</h2>
    <div className="lobby-list">
      {lobby.map(player => (
        <div key={player.id} className="lobby-player">{player.name}</div>
      ))}
      {lobby.length === 0 && <div className="lobby-player">No players in the lobby</div>}
    </div>
  </div>
);

export default Lobby;
