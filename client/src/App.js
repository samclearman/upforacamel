import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import {
  camelToColor,
  getPositions,
  getCrowds,
  getFinishers,
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
import { LongBets, FinalLongBets } from "./LongBets";
import { Dice } from "./Dice";
import { PlayerName, Player } from "./Player";
import "./App.css";

function getCookie() {
  var cookie = localStorage.getItem("camelCookie");
  if (cookie) {
    return cookie;
  }

  var cookie = uuidv4();
  localStorage.setItem("camelCookie", cookie);
  return cookie;
}

function makeSocket(gameId, onEvent) {
  console.log(`env: ${process.env.NODE_ENV}`);
  const socket =
    process.env.NODE_ENV === "development" ? io("http://localhost:8080") : io();
  socket.on("connect", () => {
    const cookie = getCookie();
    socket.emit("join", {
      gameId,
      cookie,
    });
  });

  let _nEvents = 0;
  let _gameState = null;
  let _assignedPlayer = null;
  const getStatus = () => _gameState?.status || "disconnected";
  const handleEvent = (type, event) => {
    switch (type) {
      case "game_state":
        process.env.NODE_ENV === "development" &&
          console.log("got game state", event);
        _gameState = event;
        break;
      case "player_assignment":
        _assignedPlayer = event.players[0];
        const name = localStorage.getItem("playerName");
        if (getStatus() === "init" && name) {
          socket &&
            socket.emit("change_name", {
              player: event.players[0],
              displayName: name,
            });
        }
        break;
    }
    _nEvents += 1;
    onEvent(_nEvents);
  };
  socket.on("game_state", (e) => handleEvent("game_state", e));
  socket.on("player_assignment", (e) => handleEvent("player_assignment", e));

  const getGameState = () => _gameState;
  const getAssignedPlayer = () => _assignedPlayer;
  return { socket, handleEvent, getGameState, getAssignedPlayer, getStatus };
}

function Game(props) {
  const { id } = props;
  // "nevents" is a hack to force rerender
  const [nEvents, setNEvents] = useState(0);
  const [s] = useState(() => {
    return makeSocket(id, (n) => {
      setNEvents(n);
    });
  });
  const { socket, handleEvent, getGameState, getAssignedPlayer, getStatus } = s;

  const emitEvent = (type, data) => {
    if (!getGameState()?.currentPlayer) {
      return;
    }
    socket.emit("event", {
      type,
      player: getGameState().currentPlayer,
      data,
    });
  };

  const isActive = (player) => {
    return getGameState()?.currentPlayer === (player + 1).toString();
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
    localStorage.setItem("playerName", displayName);
    socket.emit("change_name", { player, displayName });
  };

  const roll = () => {
    emitEvent("rollDice", {});
  };

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "700px",
  };
  const innerContainerStyle = {
    marginRight: "30px",
    marginLeft: "3px",
  };
  const playersStyle = {
    marginLeft: "3px",
    //marginLeft: "30px",
  };
  const startButtonStyle = {
    marginTop: "30px",
  };
  const yourTurnStyle = {
    color: "white",
    backgroundColor: "black",
    paddingLeft: "2px",
    paddingRight: "2px",
  };

  const title =
    getStatus() === "inprogress" &&
    getAssignedPlayer() === getGameState().currentPlayer ? (
      <h2>
        <span style={yourTurnStyle}>It's your turn!</span>
      </h2>
    ) : (
      <h2>Up for a camel</h2>
    );
  if (getStatus() === "init") {
    return (
      <div style={{ textAlign: "center" }}>
        <h3>Players</h3>
        <div>
          {getPlayers(getGameState()).map((p, i) => (
            <h3>
              <PlayerName
                number={i + 1}
                player={p}
                active={isActive(i)}
                editable={(i + 1).toString() === getAssignedPlayer()}
                changeName={changeName}
              />
            </h3>
          ))}
        </div>
        <button style={startButtonStyle} onClick={startGame}>
          Start game
        </button>
      </div>
    );
  } else if (getStatus() === "inprogress") {
    return (
      <div style={containerStyle}>
        <div style={innerContainerStyle}>
          {title}
          <Track
            positions={getPositions(getGameState())}
            crowds={getCrowds(getGameState())}
            placeCrowd={placeCrowd}
          />

          <h3>Bets</h3>
          <Bets
            available={getAvailableBets(getGameState())}
            onPlace={placeBet}
          />

          <h3>Race Bets</h3>
          <LongBets
            toLose={getLongBets(getGameState()).toLose}
            toWin={getLongBets(getGameState()).toWin}
            available={getAvailableLongBets(
              getGameState(),
              getAssignedPlayer()
            )}
            onPlace={placeLongBet}
          />

          <h3>Rolls</h3>
          <Dice rolled={getRolls(getGameState())} onRoll={roll} />
        </div>

        <div style={playersStyle}>
          <h3 style={{ marginTop: "27px" }}>Players</h3>
          <div>
            {getPlayers(getGameState()).map((p, i) => (
              <Player
                number={i + 1}
                player={p}
                active={isActive(i)}
                changeName={changeName}
              />
            ))}
          </div>
        </div>
      </div>
    );
  } else if (getStatus() === "ended") {
    const players = getPlayers(getGameState())
      .map((p, i) => ({ ...p, i }))
      .sort((p, q) => q.money - p.money);
    return (
      <div style={{ textAlign: "center" }}>
        <div>
          <h3>Players</h3>
          <div>
            {players.map((p) => (
              <h3>
                <Player number={p.i + 1} player={p} changeName={changeName} />
              </h3>
            ))}
          </div>
        </div>

        <Track
          positions={getPositions(getGameState())}
          finishers={getFinishers(getGameState())}
          crowds={getCrowds(getGameState())}
          placeCrowd={placeCrowd}
        />

        <FinalLongBets
          toLose={getLongBets(getGameState()).toLose}
          toWin={getLongBets(getGameState()).toWin}
        />
      </div>
    );
  }
  return "Connecting...";
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
