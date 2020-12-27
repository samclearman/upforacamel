import React from "react";

import { camelToColor, camelToTextColor } from "./helpers";

export function Bet(props) {
  const { camel, bet, onPlace, i } = props;

  const betStyle = {
    border: "1px solid black",
    width: "30px",
    height: "33px",
    paddingTop: "12px",
    display: "inline-block",
    textAlign: "center",
  };
  if (bet) {
    Object.assign(betStyle, {
      color: camelToTextColor(camel),
      backgroundColor: camelToColor(camel),
      cursor: "pointer",
    });
  }
  if (i > 0) {
    betStyle.borderLeft = 0;
  }

  return bet ? (
    <div style={betStyle} onClick={onPlace}>
      {bet}
    </div>
  ) : (
    <div style={betStyle}>&nbsp;</div>
  );
}

export function Bets(props) {
  const { available, onPlace } = props;
  const renderedBets = available.map((a, i) => (
    <Bet key={i} i={i} camel={i + 1} bet={a} onPlace={() => onPlace(i + 1)} />
  ));
  return (
    <div>
      <div>{renderedBets}</div>
    </div>
  );
}
