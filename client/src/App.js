import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import {
  camelToColor,
  getPositions,
  getCrowds,
  getCurrentLeg,
  getAvailableBets,
  getLongBets,
  getAvailableLongBets,
  getPlayers,
  getRolls,
} from "./helpers";
import { useModal } from "./Modal";
import { Track } from "./Track";
import { Bets } from "./Bets";
import { LongBets } from "./LongBets";
import { Dice } from "./Dice";
import { Player } from "./Player";
import "./App.css";

function makeSocket(gameId, handleEvent) {
  const socket = io();
  // const socket = io("http://localhost:8080");
  socket.on("connect", () => {
    const cookie = getCookie();
    socket.emit("join", {
      gameId,
      cookie,
    });
  });

  socket.on("game_state", (e) => handleEvent("game_state", e));
  socket.on("player_assignment", (e) => handleEvent("player_assignment", e));
  return socket;
}

function getCookie() {
  var cookie = localStorage.getItem("camelCookie");
  if (cookie) {
    return cookie;
  }

  var cookie = uuidv4();
  localStorage.setItem("camelCookie", cookie);
  return cookie;
}

function Game(props) {
  const { id } = props;
  const [currentPlayer, setCurrentPlayer] = useState("noplayer");
  const [_gameState, _setGameState] = useState(null);

  const setGameState = (gameState) => {
    _setGameState(gameState);
  };
  const handleEvent = (type, event) => {
    switch (type) {
      case "game_state":
        setGameState(event);
        break;
      case "player_assignment":
        setCurrentPlayer(event.players[0]);
        break;
    }
  };
  const [socket, setSocket] = useState(() => {
    return makeSocket(id, handleEvent);
  });

  const emitEvent = (type, data) => {
    if (!_gameState?.currentPlayer) {
      return;
    }
    socket.emit("event", {
      type,
      player: _gameState.currentPlayer,
      data,
    });
  };

  const isActive = (player) => {
    return _gameState?.currentPlayer === (player + 1).toString();
  };

  const placeBet = (camel) => {
    emitEvent("makeLegBet", { color: camelToColor(camel) });
  };

  const placeLongBet = (bet, camel) => {
    const kind = bet === "toWin" ? "long" : "short";
    const color = camelToColor(camel);
    emitEvent("makeRaceBet", { kind, color });
  };

  const placeCrowd = (position, direction) => {
    const desertTileIndex = position;
    const desertTileSide = direction === 1 ? "oasis" : "mirage";
    emitEvent("placeDesertTile", { desertTileIndex, desertTileSide });
  };

  const startGame = () => {
    socket.emit("start_game", { gameId: id });
  };

  const changeName = (player, displayName) => {
    socket.emit("change_name", { player, displayName });
  };

  const roll = () => {
    emitEvent("rollDice", {});
  };

  const status = _gameState?.status || "disconnected";
  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    maxWidth: "100%",
    justifyContent: "center",
  };
  const playersStyle = {
    marginLeft: "30px",
  };
  const startButtonStyle = {
    marginTop: "30px",
  };
  return (
    <div style={containerStyle}>
      {status === "inprogress" && (
        <div>
          <h2>Up for a camel</h2>
          <Track
            positions={getPositions(_gameState)}
            crowds={getCrowds(_gameState)}
            placeCrowd={placeCrowd}
          />

          <h3>Bets</h3>
          <Bets available={getAvailableBets(_gameState)} onPlace={placeBet} />

          <h3>Race Bets</h3>
          <LongBets
            toLose={getLongBets(_gameState).toLose}
            toWin={getLongBets(_gameState).toWin}
            available={getAvailableLongBets(_gameState, currentPlayer)}
            onPlace={placeLongBet}
          />

          <h3>Rolls</h3>
          <Dice rolled={getRolls(_gameState)} onRoll={roll} />
        </div>
      )}
      <div style={playersStyle}>
        <h3 style={{ marginTop: "27px" }}>Players</h3>
        <div id="players">
          {getPlayers(_gameState).map((p, i) => (
            <Player
              number={i + 1}
              player={p}
              active={isActive(i)}
              editable={
                status === "init" && (i + 1).toString() === currentPlayer
              }
              changeName={changeName}
            />
          ))}
        </div>
        {status === "init" && (
          <button style={startButtonStyle} onClick={startGame}>
            Start game
          </button>
        )}
      </div>
    </div>
  );
}

function MakeGame() {
  useEffect(() => {
    const gameId = uuidv4();
    window.location.search = `?game=${gameId}`;
  });
  return "Creating game...";
}

function App() {
  const currentGame = new URL(window.location.href).searchParams.get("game");
  if (!currentGame) {
    return <MakeGame />;
  } else {
    return <Game id={currentGame} />;
  }
}

export default App;
