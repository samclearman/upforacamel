import React from "react";
import { playerNumberToColor, camelToColor } from "./helpers"
import { useModal } from "./Modal";

function TrackTile(props) {
  const { camels } = props;

  const renderedCamels = camels.map((c) => {
    const camelStyle = {
      width: "20px",
      height: "20px",
      marginLeft: "auto",
      marginRight: "auto",
      border: "1px solid black",
      color: camelToColor(c),
      backgroundColor: camelToColor(c),
    };

    return <div style={camelStyle}>{c}</div>;
  });
  const camelTdStyle = {
    height: "120px",
    width: "30px",
    border: "1px solid black",
    verticalAlign: "bottom",
    textAlign: "center",
    backgroundColor: "beige",
  };
  return <td style={camelTdStyle}>{renderedCamels}</td>;
}

function Crowd(props) {
  const { crowd, onPlace } = props;
  const [renderModal, showModal] = useModal();
  const { player, direction } = crowd || {};
  const glyph = direction > 0 ? "🌴" : "🦴";
  const style = {
    backgroundColor: playerNumberToColor(player),
    verticalAlign: "middle",
    textAlign: "center",
    border: "1px solid black",
  };
  const innerStyle = {
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
    height: "28px",
    width: "18px",
  };
  const renderedCrowd = crowd ? glyph : "";
  const chooserStyle = { backgroundColor: "white" };
  return (
    <td style={style} onClick={showModal}>
      {renderModal(
        <table>
          <tr>
            <td style={chooserStyle} onClick={() => onPlace(-1)}>
              {"←"}
            </td>
            <td style={chooserStyle} onClick={() => onPlace(1)}>
              {"→"}
            </td>
          </tr>
        </table>
      )}
      <div style={innerStyle}>{renderedCrowd}</div>
    </td>
  );
}

export function Track(props) {
  const { positions, crowds, placeCrowd } = props;
  const renderedTiles = positions.map((p) => <TrackTile camels={p} />);
  const renderedCrowds = crowds.map((c, i) => (
    <Crowd crowd={c} onPlace={(direction) => placeCrowd(i, direction)} />
  ));
  const trackStyle = {
    maxWidth: "100%",
  };
  return (
    <table style={trackStyle}>
      <tbody>
        <tr class="camels">{renderedTiles}</tr>
        <tr class="crowds">{renderedCrowds}</tr>
      </tbody>
    </table>
  );
}
