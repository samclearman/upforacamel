import React from "react";
import { playerNumberToColor, camelToColor } from "./helpers";
import { useModal } from "./Modal";

function TrackTile(props) {
  const { camels, finish } = props;

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
  if (finish) {
    camelTdStyle.border = "1px solid white";
    camelTdStyle.backgroundColor = "white";
  }
  return <td style={camelTdStyle}>{renderedCamels}</td>;
}

function Crowd(props) {
  const { crowd, onPlace } = props;
  const [renderModal, showModal] = useModal();
  const { player, direction } = crowd || {};
  const glyph = direction > 0 ? "🌴" : "💀";
  const style = {
    verticalAlign: "middle",
    textAlign: "center",
    border: "1px solid black",
    width: "30px",
    cursor: "pointer",
  };
  const innerStyle = {
    backgroundColor: playerNumberToColor(player),
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
    height: "20px",
    width: "20px",
    border: "1px solid black",
    lineHeight: "20px",
  };
  if (!crowd) {
    innerStyle.border = "1px solid white";
  }
  const renderedCrowd = crowd ? glyph : "";
  const chooserStyle = { ...style, backgroundColor: "white" };
  return (
    <td style={style} onClick={showModal}>
      {renderModal(
        <table>
          <tr>
            <td style={chooserStyle} onClick={() => onPlace(-1)}>
              <div style={innerStyle}>{"💀"}</div>
            </td>
            <td style={chooserStyle} onClick={() => onPlace(1)}>
              <div style={innerStyle}>{"🌴"}</div>
            </td>
          </tr>
        </table>
      )}
      <div style={innerStyle}>{renderedCrowd}</div>
    </td>
  );
}

export function Track(props) {
  const { positions, crowds, placeCrowd, finishers } = props;
  const renderedTiles = positions.map((p) => <TrackTile camels={p} />);
  if (finishers && finishers.length) {
    renderedTiles.push(<TrackTile camels={finishers} finish={true} />);
  }
  const renderedCrowds = crowds.map((c, i) => (
    <Crowd crowd={c} onPlace={(direction) => placeCrowd(i, direction)} />
  ));
  const trackStyle = {
    marginLeft: "auto",
    marginRight: "auto",
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
