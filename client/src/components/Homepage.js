import React from 'react';

const Homepage = ({ onStart }) => (
  <div className="container">
    <div className="title">
      <div className="large">MURDER</div>
      <div className="small">in the dark</div>
    </div>
    <div className="buttons">
      <button className="start-btn" onClick={onStart}>Start Game</button>
      <button className="credits-btn">Credits</button>
    </div>
  </div>
);

export default Homepage;
