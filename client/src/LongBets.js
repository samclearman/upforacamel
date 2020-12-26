import React from "react";

import { playerNumberToColor, camelToColor } from "./helpers";
import { useModal } from "./Modal";

const longBetStyleBase = {
  width: "30px",
  height: "20px",
};

function LongBet(props) {
  const { camel, player, onClick } = props;
  const color = camel ? camelToColor(camel) : playerNumberToColor(player);
  const longBetStyle = {
    ...longBetStyleBase,
    border: "1px solid black",
    backgroundColor: color,
    color: color,
  };

  return (
    <td style={longBetStyle} onClick={onClick}>
      {camel || player}
    </td>
  );
}

function LongBetButton(props) {
  const { available, onPlace } = props;
  const style = {
    ...longBetStyleBase,
  };
  const [renderModal, showLongBetModal] = useModal();
  const renderedAvailableLongBets = available.map((c) => (
    <LongBet camel={c} onClick={() => onPlace(c)} />
  ));
  return (
    <td style={style} onClick={showLongBetModal}>
      {renderModal(
        <table>
          <tr>{renderedAvailableLongBets}</tr>
        </table>
      )}
      {props.children}
    </td>
  );
}

export function LongBets(props) {
  const { toWin, toLose, available, onPlace } = props;
  const renderedToWin = toWin
    .map((p) => <LongBet player={p} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toWin", camel)}
      >
        {"🏅"}
      </LongBetButton>
    );
  const renderedToLose = toLose
    .map((p) => <LongBet player={p} />)
    .concat(
      <LongBetButton
        available={available}
        onPlace={(camel) => onPlace("toLose", camel)}
      >
        {"🐌"}
      </LongBetButton>
    );
  return (
    <table class="placed-bets">
      <tr class="placed-bets-to-win">{renderedToWin}</tr>
      <tr class="placed-bets-to-lose">{renderedToLose}</tr>
    </table>
  );
}
