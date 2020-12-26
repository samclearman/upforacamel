import React, { useState } from "react";

import { playerNumberToColor } from "./helpers";
import { Bet } from "./Bets";

export function Player(props) {
  const { number, player, active, editable, changeName } = props;
  const renderedBets = player.bets.map((b, i) => (
    <Bet i={i} camel={b.camel} bet={b.payout} />
  ));
  const playerColorStyle = {
    color: playerNumberToColor(number),
  };
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
      }, 300)
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
    <>
      <span style={playerColorStyle}>■</span> {player.name}
    </>
  );
  const moneyStyle = {
    fontWeight: "normal",
    display: "inline",
    marginLeft: "10px",
  };
  return (
    <div>
      <h3>
        {nameComponent}
        <div style={moneyStyle}>💰{player.money}</div>
      </h3>

      <div class="player-bets">
        <div>{renderedBets}</div>
      </div>
    </div>
  );
}
