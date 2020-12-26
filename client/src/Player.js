import React, { useState } from "react";

import { playerNumberToColor } from "./helpers";
import { Bet } from "./Bets";

export function Player(props) {
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
