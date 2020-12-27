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

    return (
      <div key={c} style={camelStyle}>
        &nbsp;
      </div>
    );
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
    backgroundColor: "white",
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
  const chooserStyle = {
    ...innerStyle,
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
    renderedTiles.push(<TrackTile camels={finishers} finish={true} />);
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
