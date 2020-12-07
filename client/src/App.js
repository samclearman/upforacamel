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
      <h3>{number}</h3>

      <table class="player-bets">
        <tr>{renderedBets}</tr>
      </table>
    </div>
  );
}
function App() {
  const players = [
    { money: 1, bets: [{ camel: 2, payout: 5 }] },
    { money: 1, bets: [] },
    {
      money: 0,
      bets: [
        { camel: 3, payout: 5 },
        { camel: 4, payout: 3 },
      ],
    },
    {
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
        <Track
          positions={[
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
          ]}
          crowds={[
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
          ]}
        />

        <h3>Bets</h3>
        <Bets available={[5, 3, 2, 2, 5]} />

        <h3>Long Bets</h3>
        <LongBets toLose={[1, 4, 1]} toWin={[4, 3, 2, 2, 3]} />

        <h3>Rolls</h3>
        <Dice
          rolled={[
            { camel: 2, roll: 3 },
            { camel: -1, roll: 1 },
          ]}
        />
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
