import React from "react";
import { playerNumberToColor, camelToColor } from "./helpers";
import { useModal } from "./Modal";

// col = (vw - borders) / 16
//   borders = 17 * 1 = 17
// col = (vw - 17) / 16
// tile + 2 + 6 = col
// tile = ((vw - 17) / 16) - 8
// tile = ((vw - 17) / 16) - (96 / 16)
// tile = (vw - 113) / 16

// emprical testing gives ~ (vw - 154px)  / 16
// ¯\_(ツ)_/¯

const maxTileSide = "23px";
const tileSide = `min(${maxTileSide}, (100vw - 154px) / 16)`;
const tileDimensions = {
  width: tileSide,
  // maxWidth: "4.6vw",
  height: tileSide,
  //height:
  // maxHeight: "4.6vw",
  margin: "3px",
};

function TrackTile(props) {
  const { camels, finish } = props;

  const renderedCamels = camels.map((c, i) => {
    const camelStyle = {
      ...tileDimensions,
      marginTop: 0,
      marginBottom: 0,
      border: "1px solid black",
      borderBottom: 0,
      color: camelToColor(c),
      backgroundColor: camelToColor(c),
    };
    if (finish && i === camels.length - 1) {
      camelStyle.borderBottom = "1px solid black";
    }
    return (
      <div key={c} style={camelStyle}>
        &nbsp;
      </div>
    );
  });
  const camelTdStyle = {
    height: "140px",
    border: "1px solid black",
    padding: "0",
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
    padding: "0",
    cursor: "pointer",
    backgroundColor: "white",
  };
  const innerStyle = {
    ...tileDimensions,
    backgroundColor: playerNumberToColor(player),
    textAlign: "center",
    border: "1px solid black",
    fontSize: `calc(${tileSide} - 5px)`,
    lineHeight: tileSide,
  };
  if (!crowd) {
    innerStyle.border = "1px solid white";
  }
  const renderedCrowd = crowd ? glyph : "";
  const chooserStyle = {
    ...innerStyle,
    width: maxTileSide,
    height: maxTileSide,
    lineHeight: maxTileSide,
    fontSize: `calc(maxTileSide - 5px)`,
    backgroundColor: "white",
    border: "1px solid white",
  };
  return (
    <td style={style} onClick={showModal}>
      {renderModal(
        <table>
          <tbody>
            <tr>
              <td style={style} onClick={() => onPlace(-1)}>
                <div style={chooserStyle}>{"💀"}</div>
              </td>
              <td style={style} onClick={() => onPlace(1)}>
                <div style={chooserStyle}>{"🌴"}</div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div style={innerStyle}>{renderedCrowd}</div>
    </td>
  );
}

export function Track(props) {
  const { positions, crowds, placeCrowd, finishers } = props;
  const renderedTiles = positions.map((p, i) => (
    <TrackTile key={i} camels={p} />
  ));
  if (finishers && finishers.length) {
    renderedTiles.push(
      <TrackTile key={positions.length} camels={finishers} finish={true} />
    );
  }
  const renderedCrowds = crowds.map((c, i) => (
    <Crowd
      key={i}
      crowd={c}
      onPlace={(direction) => placeCrowd(i, direction)}
    />
  ));
  const trackStyle = {};
  return (
    <table style={trackStyle}>
      <tbody>
        <tr>{renderedTiles}</tr>
        <tr>{renderedCrowds}</tr>
      </tbody>
    </table>
  );
}
