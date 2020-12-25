import {
  getInitialGameState,
  makeNewPlayer,
  startGame,
  reduceEvent,
  getPlayerExistingRaceBets,
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
    }
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
      desertTileSide: "mirage",
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
      desertTileSide: "oasis",
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
      color: "red",
      kind: "long",
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
  }
].concat(addDiceRolls(100));

var gameState = getInitialGameState();
makeNewPlayer(gameState, "hi1");
makeNewPlayer(gameState, "hi2");
makeNewPlayer(gameState, "hi3");
makeNewPlayer(gameState, "hi4");
makeNewPlayer(gameState, "hi5");
makeNewPlayer(gameState, "hi6");
startGame(gameState);
for (var i = 0; i < exampleEvents.length; i++) {
  reduceEvent(gameState, exampleEvents[i]);
  if (exampleEvents[i].type === "makeRaceBet") {
    getPlayerExistingRaceBets(gameState, exampleEvents[i].player);
  }
  console.log(util.inspect(gameState, { showHidden: false, depth: null }));
}
