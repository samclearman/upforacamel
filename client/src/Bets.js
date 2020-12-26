import React from "react";

import { camelToColor, camelToTextColor } from "./helpers";

export function Bet(props) {
  const { camel, bet, onPlace } = props;
  if (!bet) {
    return <td></td>;
  }
  const betStyle = {
    border: "1px solid black",
    width: "20px",
    height: "30px",
    color: camelToTextColor(camel),
    backgroundColor: camelToColor(camel),
  };
  return (
    <td style={betStyle} onClick={onPlace}>
      {bet}
    </td>
  );
}

export function Bets(props) {
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
