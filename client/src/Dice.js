import React from "react";

import { camelToColor, camelToTextColor } from "./helpers";

function Die(props) {
  const { camel, roll, blank, i } = props;
  const dieStyle = {
    width: "30px",
    height: "25px",
    paddingTop: "5px",
    display: "inline-block",
    textAlign: "center",
  };

  if (!blank) {
    dieStyle.color = camelToTextColor(parseInt(camel));
    dieStyle.background = camelToColor(parseInt(camel));
    dieStyle.border = "1px solid black";
  } else {
    dieStyle.border = "1px solid white";
    dieStyle.cursor = "pointer";
  }
  if (i > 0) {
    dieStyle.borderLeft = 0;
  }

  return <div style={dieStyle}>{roll || <>&nbsp;</>}</div>;
}

export function Dice(props) {
  const { rolled, onRoll } = props;
  const renderedDice = rolled.map(({ camel, number }, i) => (
    <Die key={camel} i={i} camel={camel} roll={number} />
  ));
  const diceStyle = {};
  return (
    <div style={diceStyle}>
      {renderedDice}
      <span onClick={onRoll}>
        <Die blank={true} roll={"🎲"} />
      </span>
    </div>
  );
}
