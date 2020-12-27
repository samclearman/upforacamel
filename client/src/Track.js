import React from "react";
import { playerNumberToColor, camelToColor } from "./helpers";
import { useModal } from "./Modal";

const tileDimensions = {
  width: "25px",
  maxWidth: "4.6vw",
  height: "25px",
  maxHeight: "4.6vw",
};

function TrackTile(props) {
  const { camels, finish } = props;

  const renderedCamels = camels.map((c) => {
    const camelStyle = {
      ...tileDimensions,
      marginLeft: "auto",
      marginRight: "auto",
      border: "1px solid black",
      color: camelToColor(c),
      backgroundColor: camelToColor(c),
    };

    return <div style={camelStyle}>&nbsp;</div>;
  });
  const camelTdStyle = {
    height: "120px",
    border: "1px solid black",
    padding: "1px",
    paddingBottom: "0",
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
    padding: "1px",
    cursor: "pointer",
  };
  const innerStyle = {
    ...tileDimensions,
    backgroundColor: playerNumberToColor(player),
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
    border: "1px solid black",
    fontSize: "min(20px, 3.6vw)",
    lineHeight: "min(25px, 5vw)",
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
  const colStyle = {};
  const cols = positions.map(() => <col style={colStyle} />);
  const renderedTiles = positions.map((p) => <TrackTile camels={p} />);
  if (finishers && finishers.length) {
    renderedTiles.push(<TrackTile camels={finishers} finish={true} />);
  }
  const renderedCrowds = crowds.map((c, i) => (
    <Crowd crowd={c} onPlace={(direction) => placeCrowd(i, direction)} />
  ));
  const trackStyle = {};
  return (
    <table style={trackStyle}>
      {cols}
      <tbody>
        <tr class="camels">{renderedTiles}</tr>
        <tr class="crowds">{renderedCrowds}</tr>
      </tbody>
    </table>
  );
}
