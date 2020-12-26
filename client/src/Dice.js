import React from "react";

import { camelToColor, camelToTextColor } from "./helpers";

function Die(props) {
  const { camel, roll, blank } = props;
  const dieStyle = {
    width: "20px",
    height: "20px",
    color: camelToTextColor(parseInt(camel)),
  };
  if (!blank) {
    dieStyle.background = camelToColor(parseInt(camel));
    dieStyle.border = "1px solid black";
  } else {
    dieStyle.cursor = "pointer";
  }

  return <td style={dieStyle}>{roll || <>&nbsp;</>}</td>;
}

export function Dice(props) {
  const { rolled, onRoll } = props;
  const renderedDice = rolled.map(({ camel, number }) => (
    <Die camel={camel} roll={number} />
  ));
  return (
    <table onClick={onRoll}>
      <tr>
        {renderedDice}
        <Die blank={true} roll={"🎲"} />
      </tr>
    </table>
  );
}
