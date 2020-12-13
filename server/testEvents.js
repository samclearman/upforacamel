import {
  getInitialGameState,
  makeNewPlayerIfNeeded,
  startGame,
  reduceEvent,
} from "./reducer.js";
import util from "util";

function addDiceRolls(num) {
  var toReturn = [];
  var array = [
    {
      type: "rollDice",
      player: "1",
    },
    {
      type: "rollDice",
      player: "2",
    },
    {
      type: "rollDice",
      player: "3",
    },
  ];
  for (var i = 0; i < num; i++) {
    toReturn = toReturn.concat(array);
  }
  return toReturn;
}

var exampleEvents = [
  {
    type: "makeLegBet",
    player: "1",
    data: {
      color: "yellow",
    },
  },
  {
    type: "placeDesertTile",
    player: "2",
    data: {
      desertTileIndex: 3,
      desertTileSide: "oasis",
    },
  },
  {
    type: "rollDice",
    player: "3",
  },
  {
    type: "makeLegBet",
    player: "1",
    data: {
      color: "yellow",
    },
  },
  {
    type: "placeDesertTile",
    player: "2",
    data: {
      desertTileIndex: 3,
      desertTileSide: "mirage",
    },
  },
  {
    type: "rollDice",
    player: "3",
  },
  {
    type: "makeRaceBet",
    player: "1",
    data: {
      kind: "long",
      color: "red",
    },
  },
  {
    type: "placeDesertTile",
    player: "2",
    data: {
      desertTileIndex: 10,
      desertTileSide: "mirage",
    },
  },
];

var gameState = getInitialGameState();
makeNewPlayerIfNeeded(gameState, "hi1")
makeNewPlayerIfNeeded(gameState, "hi2")
makeNewPlayerIfNeeded(gameState, "hi3")
startGame(gameState)
for (var i = 0; i < exampleEvents.length; i++) {
    reduceEvent(gameState, exampleEvents[i])
    console.log(util.inspect(gameState, {showHidden: false, depth: null}))
}