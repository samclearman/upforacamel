import React, { useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { v4 as uuidv4 } from "uuid";

function TrackTile(props) {
  const { camels } = props;

  const renderedCamels = camels.map((c) => {
    const camelStyle = {
      width: "20px",
      height: "20px",
      border: "1px solid black",
      color: camelToColor(c),
      backgroundColor: camelToColor(c),
    };
    return <div style={camelStyle}>{c}</div>;
  });
  return <td>{renderedCamels}</td>;
}

function Crowd(props) {
  const { crowd } = props;
  if (crowd) {
    const { player, direction } = crowd;
    const glyph = direction > 0 ? "→" : "←";
    return (
      <td>
        <div class={`arrow-${player}`}>{glyph}</div>
      </td>
    );
  }
  return <td></td>;
}

function Track(props) {
  const { positions, crowds } = props;
  const renderedTiles = positions.map((p) => <TrackTile camels={p} />);
  const renderedCrowds = crowds.map((c) => <Crowd crowd={c} />);
  return (
    <table>
      <tr class="camels">{renderedTiles}</tr>
      <tr class="crowds">{renderedCrowds}</tr>
    </table>
  );
}

function Bet(props) {
  const { camel, bet, onPlace } = props;
  if (!bet) {
    return <td></td>;
  }
  const betStyle = {
    border: `5px solid ${camelToColor(camel)}`,
  };
  return (
    <td style={betStyle} onClick={onPlace}>
      {bet}
    </td>
  );
}

function Bets(props) {
  const { available, onPlace } = props;
  const renderedBets = available.map((a, i) => (
    <Bet camel={i + 1} bet={a} onPlace={() => onPlace(i + 1)} />
  ));
  return (
    <table>
      <tr class="available-round-bets">{renderedBets}</tr>
    </table>
  );
}

function playerNumberToColor(n) {
  return [
    "lightblue",
    "lightcoral",
    "lightgoldenrodyellow",
    "lightgreen",
    "lightsalmon",
    "lightseagreen",
    "plum",
    "sandybrown",
  ][n - 1];
}

function LongBet(props) {
  const { player } = props;
  const longBetStyle = {
    border: `5px solid ${playerNumberToColor(player)}`,
    color: "white",
  };
  return <td style={longBetStyle}>{player}</td>;
}

function LongBets(props) {
  const { toWin, toLose } = props;
  const renderedToWin = toWin.map((p) => <LongBet player={p} />);
  const renderedToLose = toLose.map((p) => <LongBet player={p} />);
  return (
    <table class="placed-bets">
      <tr class="placed-bets-to-win">{renderedToWin}</tr>
      <tr class="placed-bets-to-lose">{renderedToLose}</tr>
    </table>
  );
}

function Die(props) {
  const { camel, roll } = props;
  const dieStyle = {
    border: `5px solid ${camelToColor(camel)}`,
  };

  return <td style={dieStyle}>{roll}</td>;
}

function Dice(props) {
  const { rolled, onRoll } = props;
  const renderedDice = rolled.map(({ camel, roll }) => (
    <Die camel={camel} roll={roll} />
  ));
  return (
    <table class="rolled-dice" onClick={onRoll}>
      <tr>{renderedDice}</tr>
    </table>
  );
}

function Player(props) {
  const { number, player, active } = props;
  const renderedBets = player.bets.map((b) => (
    <Bet camel={b.camel} bet={b.payout} />
  ));
  const playerStyle = {
    backgroundColor: playerNumberToColor(number),
    border: `5px solid ${playerNumberToColor(number)}`,
  };
  if (active) {
    playerStyle.border = "1px solid black";
  }
  return (
    <div style={playerStyle}>
      <h3>{player.name}</h3>

      <table class="player-bets">
        <tr>{renderedBets}</tr>
      </table>
    </div>
  );
}

function camelToNumber(camelColor) {
  switch (camelColor) {
    case "red":
      return 1;
    case "yellow":
      return 2;
    case "blue":
      return 3;
    case "green":
      return 4;
    case "purple":
      return 5;
    case "black":
      return -1;
    case "white":
      return -2;
  }
}

function camelToColor(camelNumber) {
  switch (camelNumber) {
    case 1:
      return "red";
    case 2:
      return "yellow";
    case 3:
      return "blue";
    case 4:
      return "green";
    case 5:
      return "purple";
    case -1:
      return "black";
    case -2:
      return "white";
  }
}

function tileToNumber(tileSymbol) {
  switch (tileSymbol) {
    case "+":
      return 1;
    case "-":
      return -1;
  }
}

function getPositions(gameState) {
  return Object.values(gameState.track).map((v) =>
    v.camels.map((c) => camelToNumber(c))
  );
}

function getCrowds(gameState) {
  // return Object.values(gameState.track).map((v) =>
  //   v.tiles.map((c) => tileToNumber(t))
  // );
  const crowds = [];
  for (let i = 0; i < 16; i++) {
    crowds.push(null);
    for (const n in gameState.players) {
      const v = Object.values(gameState.players[n].legs).slice(-1)[0]
        .desertTile;
      if (Math.abs(v) === i) {
        crowds[i] = { player: n + 1, direction: v ? v / Math.abs(v) : 1 };
      }
    }
  }
  return crowds;
}

function getAvailableBets(gameState) {
  const bets = [];
  for (const c in gameState.remainingLegBets) {
    bets[camelToNumber(c) - 1] = gameState.remainingLegBets[c].slice(-1)[0];
  }
  return bets;
}

function getPlayers(gameState) {
  return Object.entries(gameState.players).map(([n, p]) => {
    const lastLeg = Object.values(p.legs).slice(-1)[0];
    const bets = [];
    for (const c in lastLeg.legBets) {
      for (const payout of lastLeg.legBets[c]) {
        bets.push({ camel: camelToNumber(c), payout });
      }
    }
    return { name: n, money: 0, bets };
  });
}

function makeSocket(setGameState) {
  const socket = io("http://localhost:3030");
  socket.on("connect", () => {
    console.log("connect", socket.id);
  });

  socket.on("game_state", setGameState);

  const cookie = getCookie();
  socket.emit("register_cookie", {
    cookie,
  });

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

function App() {
  const [positions, setPositions] = useState([]);
  const [crowds, setCrowds] = useState([]);
  const [availableBets, setAvailableBets] = useState([]);
  const [players, setPlayers] = useState([]);
  const [_gameState, _setGameState] = useState({});

  const setGameState = (gameState) => {
    console.log(gameState);
    setPositions(getPositions(gameState));
    setCrowds(getCrowds(gameState));
    setAvailableBets(getAvailableBets(gameState));
    setPlayers(getPlayers(gameState));
    _setGameState(gameState);
  };
  const [socket, setSocket] = useState(() => {
    return makeSocket(setGameState);
  });

  socket.on("game_state", (gameState) => {});

  const emitEvent = (type, data) => {
    if (!_gameState.currentPlayer) {
      console.log("no current player");
      return;
    }
    socket.emit("event", {
      type,
      player: _gameState.currentPlayer,
      data,
    });
  };

  const isActive = (player) => {
    return _gameState.currentPlayer === (player + 1).toString();
  };

  const placeBet = (camel) => {
    emitEvent("makeLegBet", { color: camelToColor(camel) });
  };

  const roll = () => {
    emitEvent("rollDice", {});
  };

  const longBets = {
    toLose: [1, 4, 1],
    toWin: [5, 3, 2, 2, 5],
  };

  const rolled = [
    { camel: 2, roll: 3 },
    { camel: -1, roll: 1 },
  ];

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
  };
  const playersStyle = {
    marginLeft: "30px",
  };
  return (
    <div style={containerStyle}>
      <div>
        <h3>Track</h3>
        <Track positions={positions} crowds={crowds} />

        <h3>Bets</h3>
        <Bets available={availableBets} onPlace={placeBet} />

        <h3>Long Bets</h3>
        <LongBets toLose={longBets.toLose} toWin={longBets.toWin} />

        <h3>Rolls</h3>
        <Dice rolled={rolled} onRoll={roll} />
      </div>
      <div style={playersStyle}>
        <h2>Players</h2>
        <div id="players">
          {players.map((p, i) => (
            <Player number={i + 1} player={p} active={isActive(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
