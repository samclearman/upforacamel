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
    player: "4",
    data: {
      color: "yellow",
    },
  },
  {
    type: "makeLegBet",
    player: "5",
    data: {
      color: "red",
    },
  },
  {
    type: "makeLegBet",
    player: "6",
    data: {
      color: "green",
    },
  },
  {
    type: "pickPartner",
    player: "1",
    data: {
      partner: "2",
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
    type: "pickPartner",
    player: "3",
    data: {
      partner: "4",
    },
  },
  {
    type: "makeRaceBet",
    player: "4",
    data: {
      kind: "long",
      color: "red",
    },
  },
  {
    type: "rollDice",
    player: "5",
  },
  {
    type: "rollDice",
    player: "6",
  },
  {
    type: "makeRaceBet",
    player: "1",
    data: {
      "color": "red",
      "kind": "long",
    }
  },
  {
    type: "placeDesertTile",
    player: "2",
    data: {
      desertTileIndex: 10,
      desertTileSide: "mirage",
    },
  },
  {
    type: "rollDice",
    player: "3",
  },
  {
    type: "rollDice",
    player: "4",
  },
  {
    type: "rollDice",
    player: "5",
  },
  {
    type: "rollDice",
    player: "6",
  },
  {
    type: "rollDice",
    player: "1",
  },
  {
    type: "rollDice",
    player: "2",
  },
];

var gameState = getInitialGameState();
makeNewPlayerIfNeeded(gameState, "hi1")
makeNewPlayerIfNeeded(gameState, "hi2")
makeNewPlayerIfNeeded(gameState, "hi3")
makeNewPlayerIfNeeded(gameState, "hi4")
makeNewPlayerIfNeeded(gameState, "hi5")
makeNewPlayerIfNeeded(gameState, "hi6")
startGame(gameState)
for (var i = 0; i < exampleEvents.length; i++) {
    reduceEvent(gameState, exampleEvents[i])
    console.log(util.inspect(gameState, {showHidden: false, depth: null}))
}