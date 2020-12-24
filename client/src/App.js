import React, { useEffect, useState } from "react";
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
  const trackStyle = {
    maxWidth: "100%",
  };
  return (
    <table style={trackStyle}>
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

  return <td style={dieStyle}>{roll || <>&nbsp;</>}</td>;
}

function Dice(props) {
  const { rolled, onRoll } = props;
  const renderedDice = Object.entries(rolled).map(([camel, roll]) => (
    <Die camel={camel} roll={roll} />
  ));
  return (
    <table onClick={onRoll}>
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
  const { number, player, active, editable, changeName } = props;
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
  let [name, setName] = useState(player.name);
  let [timeoutId, setTimeoutId] = useState();
  let [pendingUpdate, setPendingUpdate] = useState(false);
  const handleNameChange = (e) => {
    setPendingUpdate(true);
    const name = e.target.value;
    setName(name);
    if (timeoutId) clearTimeout(timeoutId);
    setTimeoutId(
      setTimeout(() => {
        changeName(number, name);
        pendingUpdate = false;
      }, 1000)
    );
  };
  const nameComponent = editable ? (
    <form>
      <input
        type="text"
        value={pendingUpdate ? name : player.name}
        onChange={handleNameChange}
      ></input>
    </form>
  ) : (
    player.name
  );
  const moneyStyle = {
    fontWeight: "normal",
    display: "inline",
    marginLeft: "10px",
  };
  return (
    <div style={playerStyle}>
      <h3>
        {nameComponent}
        <div style={moneyStyle}>💰{player.money}</div>
      </h3>

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
  if (!gameState) {
    return [];
  }
  return Object.values(gameState.track).map((v) =>
    v.camels.map((c) => camelToNumber(c))
  );
}

function getCrowds(gameState) {
  if (!gameState) {
    return [];
  }
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
function getCurrentLeg(gameState) {
  return gameState.legs[gameState.currentLegNum];
}

function getAvailableBets(gameState) {
  if (!gameState) {
    return [];
  }
  const bets = [];
  for (const c in getCurrentLeg(gameState).remainingLegBets) {
    bets[camelToNumber(c) - 1] = getCurrentLeg(gameState).remainingLegBets[
      c
    ].slice(-1)[0];
  }
  return bets;
}

function getLongBets(gameState) {
  if (!gameState) {
    return { toLose: [], toWin: [] };
  }
  return {
    toLose: gameState.shortRaceBets.map((b) => parseInt(b.player)),
    toWin: gameState.longRaceBets.map((b) => parseInt(b.player)),
  };
}

function getAvailableLongBets(gameState, player) {
  const placed = [].concat(
    gameState.players[player]?.raceBets?.longRaceBets || [],
    gameState.players[player]?.raceBets?.shortRaceBets || []
  );
  return [1, 2, 3, 4, 5].filter((n) => !placed.includes(camelToColor(n)));
}

function getPlayers(gameState) {
  if (!gameState) {
    return [];
  }
  return Object.entries(gameState.players).map(([n, p]) => {
    const lastLeg = Object.values(p.legs).slice(-1)[0];
    const bets = [];
    for (const c in lastLeg.legBets) {
      for (const payout of lastLeg.legBets[c]) {
        bets.push({ camel: camelToNumber(c), payout });
      }
    }
    let money = Object.values(p.legs)
      .map((leg) => leg.score || 0)
      .reduce((x, y) => x + y);
    if (gameState.finalScore) {
      money = gameState.finalScore[n] || 0;
    }
    return { name: p.displayName, money, bets };
  });
}

function getRolls(gameState) {
  const rolled = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    "-1": null,
    "-2": null,
  };
  if (!gameState) {
    return rolled;
  }
  for (const die of getCurrentLeg(gameState).rolledDice) {
    rolled[camelToNumber(die.color)] = die.number;
  }
  return rolled;
}

function makeSocket(gameId, handleEvent) {
  const socket = io();
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
          <h3>Track</h3>
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
        <h2>Players</h2>
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
