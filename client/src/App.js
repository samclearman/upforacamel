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
  const { crowd, onPlace } = props;
  const [renderModal, showModal] = useModal();
  const { player, direction } = crowd || {};
  const glyph = direction > 0 ? "→" : "←";
  const renderedCrowd = crowd ? <div>{glyph}</div> : <div></div>;
  return (
    <td onClick={showModal}>
      {renderModal(
        <table>
          <tr>
            <td
              style={{ backgroundColor: "white" }}
              onClick={() => onPlace(-1)}
            >
              {"←"}
            </td>
            <td style={{ backgroundColor: "white" }} onClick={() => onPlace(1)}>
              {"→"}
            </td>
          </tr>
        </table>
      )}
      {renderedCrowd}
    </td>
  );
}

function Track(props) {
  const { positions, crowds, placeCrowd } = props;
  const renderedTiles = positions.map((p) => <TrackTile camels={p} />);
  const renderedCrowds = crowds.map((c, i) => (
    <Crowd crowd={c} onPlace={(direction) => placeCrowd(i, direction)} />
  ));
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
    border: `1px solid black`,
    color: camelToTextColor(camel),
    backgroundColor: camelToColor(camel),
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
  const { camel, player, onClick } = props;
  const color = camel ? camelToColor(camel) : playerNumberToColor(player);
  const longBetStyle = {
    border: `1px solid black`,
    backgroundColor: color,
    color: color,
  };
  return (
    <td style={longBetStyle} onClick={onClick}>
      {camel || player}
    </td>
  );
}

function useModal(children) {
  let [showingModal, setShowingModal] = useState(false);
  let [modalLeft, setModalLeft] = useState(0);
  let [modalTop, setModalTop] = useState(0);
  const showModal = (e) => {
    setModalTop(e.clientY);
    setModalLeft(e.clientX);
    setShowingModal(true);
  };
  return [
    (children) =>
      showingModal && (
        <Modal
          left={modalLeft}
          top={modalTop}
          close={() => setShowingModal(false)}
        >
          {children}
        </Modal>
      ),
    showModal,
  ];
}

function LongBetButton(props) {
  const { available, onPlace } = props;
  const style = {
    border: "none",
  };
  const [renderModal, showLongBetModal] = useModal();
  const renderedAvailableLongBets = available.map((c) => (
    <LongBet camel={c} onClick={() => onPlace(c)} />
  ));
  return (
    <td style={style} onClick={showLongBetModal}>
      {renderModal(
        <table>
          <tr>{renderedAvailableLongBets}</tr>
        </table>
      )}
      {props.children}
    </td>
  );
}

function LongBets(props) {
  const { toWin, toLose, available, onPlace } = props;
  const renderedToWin = toWin
    .map((p) => <LongBet player={p} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toWin", camel)}
      >
        {"→"}
      </LongBetButton>
    );
  const renderedToLose = toLose
    .map((p) => <LongBet player={p} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toLose", camel)}
      >
        {"←"}
      </LongBetButton>
    );
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
    border: `1px solid black`,
    color: camelToTextColor(parseInt(camel)),
    backgroundColor: camelToColor(parseInt(camel)),
  };

  return <td style={dieStyle}>{roll}</td>;
}

function Dice(props) {
  const { rolled, onRoll } = props;
  const renderedDice = Object.entries(rolled).map(([camel, roll]) => (
    <Die camel={camel} roll={roll} />
  ));
  return (
    <table class="rolled-dice" onClick={onRoll}>
      <tr>{renderedDice}</tr>
    </table>
  );
}

function Modal(props) {
  const { close } = props;
  const outerStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  };
  const innerStyle = {
    position: "fixed",
    left: props.left,
    top: props.top,
  };
  const handleClick = (e) => {
    e.stopPropagation();
    close();
  };
  return (
    <div style={outerStyle} onClick={handleClick}>
      <div style={innerStyle}>{props.children}</div>
    </div>
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

function camelToTextColor(camelNumber) {
  switch (camelNumber) {
    case 1:
      return "black";
    case 2:
      return "black";
    case 3:
      return "white";
    case 4:
      return "black";
    case 5:
      return "white";
    case -1:
      return "white";
    case -2:
      return "black";
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
  return Object.values(gameState.track).map((v) =>
    v.tiles.length
      ? {
          player: 1,
          direction: tileToNumber(v.tiles[0]),
        }
      : null
  );
  // const crowds = [];
  // for (let i = 0; i < 16; i++) {
  //   crowds.push(null);
  //   for (const n in gameState.players) {
  //     const v = Object.values(gameState.players[n].legs).slice(-1)[0]
  //       .desertTile;
  //     if (Math.abs(v) === i) {
  //       crowds[i] = { player: n + 1, direction: v ? v / Math.abs(v) : 1 };
  //     }
  //   }
  // }
  // return crowds;
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
    const cookie = getCookie();
    socket.emit("register_cookie", {
      cookie,
    });
  });

  socket.on("game_state", setGameState);

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

function Game() {
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

  const placeLongBet = (bet, camel) => {
    const kind = bet === "toWin" ? "long" : "short";
    const color = camelToColor(camel);
    emitEvent("makeRaceBet", { kind, camel });
  };

  const placeCrowd = (position, direction) => {
    const desertTileIndex = position;
    const desertTileSide = direction === 1 ? "oasis" : "mirage";
    emitEvent("placeDesertTile", { desertTileIndex, desertTileSide });
  };

  const roll = () => {
    emitEvent("rollDice", {});
  };

  const longBets = {
    toLose: [1, 4, 1],
    toWin: [5, 3, 2, 2, 5],
  };

  const rolled = {
    1: null,
    2: 1,
    3: null,
    4: null,
    5: 3,
    "-1": 2,
    "-2": null,
  };

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
        <Track positions={positions} crowds={crowds} placeCrowd={placeCrowd} />

        <h3>Bets</h3>
        <Bets available={availableBets} onPlace={placeBet} />

        <h3>Long Bets</h3>
        <LongBets
          toLose={longBets.toLose}
          toWin={longBets.toWin}
          available={[1, 2, 4]}
          onPlace={placeLongBet}
        />

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

function App() {
  const currentGame = new URL(window.location.href).searchParams.get("game");
  if (!currentGame) {
    // return start game screen
    return "not implemented";
  } else {
    return <Game id={currentGame} />;
  }
}

export default App;
