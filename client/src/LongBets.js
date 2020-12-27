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
  };
  if (camel && player) {
    longBetStyle.background = `linear-gradient(0deg, ${camelToColor(
      camel
    )} 0 66%, ${playerNumberToColor(player)} 66%)`;
  } else {
    longBetStyle.background = color;
  }
  if (i > 0) {
    longBetStyle.borderLeft = 0;
  }

  return (
    <div style={longBetStyle} onClick={onClick}>
      &nbsp;
    </div>
  );
}

function LongBetButton(props) {
  const { available, onPlace } = props;
  const style = {
    ...longBetStyleBase,
    border: "1px solid white",
    cursor: "pointer",
  };
  const [renderModal, showLongBetModal] = useModal();
  const renderedAvailableLongBets = available.map((c, i) => (
    <LongBet key={c} i={i} camel={c} onClick={() => onPlace(c)} />
  ));
  return (
    <div style={style} onClick={showLongBetModal}>
      {renderModal(
        <div>
          <div style={{ cursor: "pointer" }}>{renderedAvailableLongBets}</div>
        </div>
      )}
      {props.children}
    </div>
  );
}

export function FinalLongBets(props) {
  const { toWin, toLose } = props;
  const renderedToWin = toWin.map(({ player, camel }, i) => (
    <LongBet i={i} player={player} camel={camel} />
  ));
  const renderedToLose = toLose.map(({ player, camel }, i) => (
    <LongBet player={player} i={i} camel={camel} />
  ));
  const toWinLabel = "🏅";
  const toLoseLabel = "🐌";
  return (
    <div>
      <h3>{toWinLabel}</h3>
      <div>{renderedToWin}</div>
      <h3>{toLoseLabel}</h3>
      <div>{renderedToLose}</div>
    </div>
  );
}

export function LongBets(props) {
  const { toWin, toLose, available, onPlace } = props;
  const renderedToWin = toWin
    .map(({ player: p }, i) => <LongBet key={i} i={i} player={p} />)
    .concat(
      <LongBetButton
        key={toWin.length}
        available={available}
        onPlace={(camel) => onPlace("toWin", camel)}
      >
        {"🏅"}
      </LongBetButton>
    );
  const renderedToLose = toLose
    .map(({ player: p }, i) => <LongBet key={i} i={i} player={p} />)
    .concat(
      <LongBetButton
        key={toLose.length}
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
