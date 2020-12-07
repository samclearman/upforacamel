import React from "react";
import logo from "./logo.svg";
import "./App.css";

function TrackTile(props) {
  const { camels } = props;
  const renderedCamels = camels.map((c) => <div id={`camel-${c}`}>{c}</div>);
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
  const { camel, bet } = props;
  if (!bet) {
    return <td></td>;
  }
  return <td class={`bet-${camel}`}>{bet}</td>;
}

function Bets(props) {
  const { available } = props;
  const renderedBets = available.map((a, i) => <Bet camel={i + 1} bet={a} />);
  return (
    <table>
      <tr class="available-round-bets">{renderedBets}</tr>
    </table>
  );
}

function LongBet(props) {
  const { player } = props;
  return <td class={`long-bet-${player}`}>{player}</td>;
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
  return <td class={`die-${camel}`}>{roll}</td>;
}

function Dice(props) {
  const { rolled } = props;
  const renderedDice = rolled.map(({ camel, roll }) => (
    <Die camel={camel} roll={roll} />
  ));
  return (
    <table class="rolled-dice">
      <tr>{renderedDice}</tr>
    </table>
  );
}

function Player(props) {
  const { number, player } = props;
  const renderedBets = player.bets.map((b) => (
    <Bet camel={b.camel} bet={b.payout} />
  ));
  return (
    <div class={`player-${number}`}>
      <h3>{player.name}</h3>

      <table class="player-bets">
        <tr>{renderedBets}</tr>
      </table>
    </div>
  );
}
function App() {
  const positions = [
    [2, 1],
    [3],
    [4, 5],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [-1],
    [-2],
  ];
  const crowds = [
    null,
    null,
    null,
    { player: 1, direction: 1 },
    null,
    { player: 2, direction: -1 },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  const availableBets = [5, 3, 2, 2, 5];
  const longBets = {
    toLose: [1, 4, 1],
    toWin: [5, 3, 2, 2, 5],
  };
  const rolled = [
    { camel: 2, roll: 3 },
    { camel: -1, roll: 1 },
  ];
  const players = [
    { name: "sam", money: 1, bets: [{ camel: 2, payout: 5 }] },
    { name: "cat", money: 1, bets: [] },
    {
      name: "steven",
      money: 0,
      bets: [
        { camel: 3, payout: 5 },
        { camel: 4, payout: 3 },
      ],
    },
    {
      name: "some asshole with a really long name",
      money: 0,
      bets: [
        { camel: 4, payout: 5 },
        { camel: 3, payout: 3 },
      ],
    },
  ];
  return (
    <div class="container">
      <div class="game">
        <h3>Track</h3>
        <Track positions={positions} crowds={crowds} />

        <h3>Bets</h3>
        <Bets available={availableBets} />

        <h3>Long Bets</h3>
        <LongBets toLose={longBets.toLose} toWin={longBets.toWin} />

        <h3>Rolls</h3>
        <Dice rolled={rolled} />
      </div>
      <div class="Players">
        <h2>Players</h2>
        <div id="players">
          {players.map((p, i) => (
            <Player number={i + 1} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
