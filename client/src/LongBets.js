import React from "react";

import { playerNumberToColor, camelToColor } from "./helpers";
import { useModal } from "./Modal";

const longBetStyleBase = {
  width: "30px",
  height: "33px",
  paddingTop: "12px",
  display: "inline-block",
  textAlign: "center",
};

function LongBet(props) {
  const { camel, player, onClick, i } = props;
  const color = camel ? camelToColor(camel) : playerNumberToColor(player);
  const longBetStyle = {
    ...longBetStyleBase,
    border: "1px solid black",
    backgroundColor: color,
    color: color,
  };
  if (i > 0) {
    longBetStyle.borderLeft = 0;
  }

  return (
    <div style={longBetStyle} onClick={onClick}>
      {camel || player}
    </div>
  );
}

function LongBetButton(props) {
  const { available, onPlace } = props;
  const style = {
    ...longBetStyleBase,
    border: "1px solid white",
  };
  const [renderModal, showLongBetModal] = useModal();
  const renderedAvailableLongBets = available.map((c, i) => (
    <LongBet i={i} camel={c} onClick={() => onPlace(c)} />
  ));
  return (
    <div style={style} onClick={showLongBetModal}>
      {renderModal(
        <div>
          <div>{renderedAvailableLongBets}</div>
        </div>
      )}
      {props.children}
    </div>
  );
}

export function LongBets(props) {
  const { toWin, toLose, available, onPlace } = props;
  const renderedToWin = toWin
    .map((p, i) => <LongBet i={i} player={p} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toWin", camel)}
      >
        {"🏅"}
      </LongBetButton>
    );
  const renderedToLose = toLose
    .map((p, i) => <LongBet player={p} i={i} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toLose", camel)}
      >
        {"🐌"}
      </LongBetButton>
    );
  return (
    <div>
      <div>{renderedToWin}</div>
      <div>{renderedToLose}</div>
    </div>
  );
}
