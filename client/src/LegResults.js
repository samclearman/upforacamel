import React from "react";
import { Bet } from "./Bets";
import { playerNumberToColor, camelToNumber } from "./helpers";

function PlayerLegResult({ player, children }) {
  const cellStyle = {
    padding: '10px',
    textAlign: 'left'
  };
  const headerStyle = {
    ...cellStyle,
  };
  return (
    <tr key={player.playerId}>
      { children }
      <th scope="row" style={headerStyle}>{player.name}</th>
      <td style={cellStyle}>{player.totalScore}</td>
      <td style={cellStyle}>{player.rollPoints}</td>
      <td style={cellStyle}>{player.betPoints}</td>
      <td style={cellStyle}>{player.desertTilePoints}</td>
      <td style={cellStyle}>
        { player.bets?.map((bet, idx) => (
          <Bet camel={camelToNumber(bet.color)} bet={bet.payout} i={idx} />
        )) }
      </td>
    </tr>
  );
}

function LegResult({ result }) {
  const numPlayers = result.players.length;
  const firstPlayer = result.players[0];
  const restPlayers = result.players.slice(1);
  const headerStyle = {
    padding: '10px',
    color: 'grey'
  }
  // rowSpan={numPlayers}
  return (
    <tbody>
      <PlayerLegResult player={firstPlayer}>
        <th scope="rowgroup" style={headerStyle}>
          {result.legNumber}.
        </th>
      </PlayerLegResult>
      { restPlayers?.map(player => (
        <PlayerLegResult player={player}><th /></PlayerLegResult>
      )) }
    </tbody>
  );
}

export function LegResults({ results }) {
  const captionStyle = {
    textAlign: 'left'
  };
  return (
    <table>
      <thead>
        <tr>
          <th /><th /><th>💰</th><th>🎲</th><th>🐪</th><th>🌴</th>
        </tr>
      </thead>

      {results?.map((leg) => (
        <LegResult key={leg.legNumber} result={leg}/>
      ))}
    </table>
  );
}
