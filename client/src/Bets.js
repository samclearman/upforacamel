import React from "react";

import { camelToColor, camelToTextColor } from "./helpers";

export function Bet(props) {
  const { camel, bet, onPlace, i } = props;
  if (!bet) {
    return <div></div>;
  }
  const betStyle = {
    border: "1px solid black",
    width: "30px",
    height: "33px",
    paddingTop: "12px",
    display: "inline-block",
    textAlign: "center",

    color: camelToTextColor(camel),
    backgroundColor: camelToColor(camel),
  };
  if (i > 0) {
    betStyle.borderLeft = 0;
  }
  return (
    <div style={betStyle} onClick={onPlace}>
      {bet}
    </div>
  );
}

export function Bets(props) {
  const { available, onPlace } = props;
  const renderedBets = available.map((a, i) => (
    <Bet i={i} camel={i + 1} bet={a} onPlace={() => onPlace(i + 1)} />
  ));
  return (
    <div>
      <div class="available-round-bets">{renderedBets}</div>
    </div>
  );
}
