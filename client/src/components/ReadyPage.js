const ReadyPage = ({ isFlipped, toggleFlip, showReadyButton, playerRole, getRoleDetails }) => {
  return (
    <div className="flip-card-app">
      <div
        className={`flip-card ${isFlipped ? "flipped" : ""}`}
        onClick={toggleFlip}
      >
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <img
              src="cardback.jpg"
              alt="Avatar"
              style={{ width: "250px", height: "300px" }}
            />
          </div>
          <div className="flip-card-back">
            <img
              src={getRoleDetails(playerRole).image}
              alt="Role Image"
              style={{ width: "250px", height: "300px" }}
            />
          </div>
        </div>
      </div>

      <div className={`fade-text ${isFlipped ? "visible" : ""}`} style={{ color: getRoleDetails(playerRole).color }}>
        <div className="main-text">You are a {playerRole ? playerRole : "broken phone"}.</div>
        <div className="subtitle">{getRoleDetails(playerRole).text}</div>
      </div>

      {isFlipped && (
        <button className="ready-button">Ready</button>
      )}
    </div>
  );
};

export default ReadyPage;
