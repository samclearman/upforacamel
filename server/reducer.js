import _ from "lodash";
import util from "util";

export function makeNewPlayerIfNeeded(gameState, cookie) {
  for (var i = 0; i < Object.keys(gameState.players).length; i++) {
    if (gameState.players[i + 1].cookie === cookie) {
      console.log(`Cookie ${cookie} is already associated with a player`);
      return;
    }
  }

  if (gameState.started) {
    console.log("Invalid move. Player cannot be added to a started game");
    return;
  }

  gameState.numberPlayers += 1;
  const newPlayer = _.cloneDeep(initialPlayerState);
  newPlayer.cookie = cookie;
  gameState.players[gameState.numberPlayers.toString()] = newPlayer;
}

export function startGame(gameState) {
  gameState.started = true;
}

export function reduceEvent(currentState, event) {
  validateEvent(currentState, event);

  switch (event.type) {
    case "makeLegBet":
      makeLegBet(currentState, event);
      break;
    case "rollDice":
      rollDice(currentState, event);
      break;
    case "placeDesertTile":
      placeDesertTile(currentState, event);
      break;
    case "makeRaceBet":
      makeRaceBet(currentState, event);
      break;
    case "pickPartner":
      break;
  }
  // 1-indexed
  currentState.currentPlayer = (
    (parseInt(currentState.currentPlayer) % currentState.numberPlayers) +
    1
  ).toString();
}

function validateEvent(currentState, event) {
  var track = currentState.track;
  var currentLeg = currentState.currentLeg;
  var currentPlayer = event.player;

  if (currentPlayer !== currentState.currentPlayer) {
    throw new Error(
      `Invalid move. Player ${currentPlayer} acted out of turn. It is player ${currentState.currentPlayer}'s turn.`
    );
  }
  switch (event.type) {
    case "makeLegBet":
      var selectedColor = event.data.color;
      if (currentState.remainingLegBets[selectedColor].length === 0) {
        throw new Error("Invalid move. Player has no more leg bets for color");
      }
      break;
    case "rollDice":
      // todo
      break;
    case "placeDesertTile":
      var desertTileIndex = event.data.desertTileIndex;
      if (desertTileIndex === 0) {
        throw new Error("Invalid move. Cannot place on first tile");
      }
      var existingDesertTile =
        currentState["players"][currentPlayer]["legs"][currentLeg][
          "desertTile"
        ];

      function checkDesertTileIndex(index) {
        if (
          index < 16 &&
          index > 0 &&
          track[index]["tiles"].length > 0 &&
          Math.abs(existingDesertTile) !== index
        ) {
          throw new Error(
            `Invalid move. Another player's tile is at index ${index}`
          );
        }
      }
      // there are no other users' tiles on +/- 1 of this spot
      checkDesertTileIndex(desertTileIndex);
      checkDesertTileIndex(desertTileIndex + 1);
      checkDesertTileIndex(desertTileIndex - 1);

      // if user is already already there, they must flip the tile side
      if (Math.abs(existingDesertTile) === desertTileIndex) {
        if (existingDesertTile > 0 && event.data.desertTileSide === "oasis") {
          throw new Error(
            "Invalid move. Player already has an oasis desert tile here"
          );
        } else if (
          existingDesertTile < 0 &&
          event.data.desertTileSide === "mirage"
        ) {
          throw new Error(
            "Invalid move. Player already has an mirage desert tile here"
          );
        }
      }
      break;
    case "makeRaceBet":
      var color = event.data.color;

      var raceBets = getPlayerExistingRaceBets(currentPlayer);
      if (
        raceBets["longRaceBets"].includes(color) ||
        raceBets["shortRaceBets"].includes(color)
      ) {
        throw new Error(
          "Invalid move. Player has already made a race bet with this color"
        );
      }
      break;
    case "pickPartner":
      break;
  }
}

function makeLegBet(currentState, event) {
  var currentPlayer = event.player;
  var currentLeg = currentState.currentLeg;
  var selectedColor = event.data.color;
  var payoff = currentState.remainingLegBets[selectedColor].pop();
  currentState.players[currentPlayer]["legs"][currentLeg]["legBets"][
    selectedColor
  ].push(payoff);
}

function getPlayerExistingRaceBets(currentState, player) {
  var longRaceBets = [];
  for (o in currentState["longRaceBets"]) {
    if (o.player == player) {
      longRaceBets.push(o.color);
    }
  }
  var shortRaceBets = [];
  for (o in currentState["shortRaceBets"]) {
    if (o.player == player) {
      shortRaceBets.push(o.color);
    }
  }
  return {
    longRaceBets: longRaceBets,
    shortRaceBets: shortRaceBets,
  };
}

function makeRaceBet(currentState, event) {
  var kind = event.data.kind;
  var color = event.data.color;
  var currentPlayer = event.player;

  var category = kind === "long" ? "longRaceBets" : "shortRaceBets";
  currentState[category].push({
    player: currentPlayer,
    color: color,
  });
}

function placeDesertTile(currentState, event) {
  var track = currentState.track;
  var currentLeg = currentState.currentLeg;
  var currentPlayer = event.player;

  var desertTileIndex = event.data.desertTileIndex;
  var isOasis = event.data.desertTileSide === "oasis";

  // remove existing desert tile
  var existingDesertTile =
    currentState["players"][currentPlayer]["legs"][currentLeg]["desertTile"];
  if (existingDesertTile !== -100) {
    track[Math.abs(existingDesertTile)]["tiles"] = [];
  }

  // add new desert tile
  track[desertTileIndex]["tiles"] = [isOasis ? "+" : "-"];
  currentState["players"][currentPlayer]["legs"][currentLeg][
    "desertTile"
  ] = desertTileIndex;
}

var colorCamels = ["red", "blue", "purple", "yellow", "green"];
var bwCamels = ["black", "white"];

function isColorCamel(color) {
  return colorCamels.includes(color);
}

function getCamelPositionAndStack(track, color) {
  console.log(`getCamelPositionAndStack: track ${track}; color ${color}`);
  console.log(util.inspect(track, { showHidden: false, depth: null }));
  for (var i = 0; i < Object.keys(track).length; i++) {
    if (track[i]["camels"].includes(color)) {
      var camelIndex = track[i]["camels"].indexOf(color);
      var camelsToMove = track[i]["camels"].slice(camelIndex);
      return [i, camelsToMove];
    }
  }
  return [-1, null];
}

function pickBlackOrWhiteCamel(track, rolledDiceColor) {
  var [blackPosition, blackCamelsToMove] = getCamelPositionAndStack(
    track,
    "black"
  );
  var [whitePosition, whiteCamelsToMove] = getCamelPositionAndStack(
    track,
    "white"
  );

  var camelColor = null;
  if (blackCamelsToMove.length === 1) {
    if (whiteCamelsToMove === 1) {
      // if neither camel is carrying anyone, move whichever was rolled
      camelColor = rolledDiceColor;
    } else if (whiteCamelsToMove[1] === "black") {
      // if white camel is carrying black camel, then use black
      camelColor = "black";
    } else {
      // if white camel is not carrying black camel, then use white
      camelColor = "white";
    }
  } else {
    if (whiteCamelsToMove === 1) {
      // if black camel is carrying white, move white; else black
      if (blackCamelsToMove[1] === "white") {
        camelColor = "white";
      } else {
        camelColor = "black";
      }
    } else {
      // both camels are carrying other camels
      if (blackCamelsToMove[1] === "white") {
        camelColor = "white";
      } else if (whiteCamelsToMove[1] === "white") {
        camelColor = "black";
      } else {
        camelColor = rolledDiceColor;
      }
    }
  }
  return camelColor;
}

function moveCamel(track, color, position, newPosition, placeUnder) {
  var camelIndex = track[position]["camels"].indexOf(color);
  var camelsToMove = track[position]["camels"].slice(camelIndex);
  track[position]["camels"] = track[position]["camels"].slice(0, camelIndex);

  if (newPosition) {
    if (!placeUnder) {
      track[newPosition]["camels"] = track[newPosition]["camels"].concat(
        camelsToMove
      );
    } else {
      track[newPosition]["camels"] = camelsToMove.concat(
        track[newPosition]["camels"]
      );
    }
  }
}

function rollDice(currentState, event) {
  var currentPlayer = event.player;
  var currentLeg = currentState.currentLeg;
  var track = currentState.track;
  var currentRound = currentState.rounds[currentLeg];

  var rolledDiceColor = _.sample(currentRound.remainingDice);
  _.remove(currentRound.remainingDice, function (item) {
    item === rolledDiceColor;
  });
  if (rolledDiceColor === "bw") {
    rolledDiceColor = _.sample(bwCamels);
  }
  var rolledDiceNumber = _.sample([1, 2, 3]);
  console.log(`color ${rolledDiceColor}; number ${rolledDiceNumber}`);
  currentRound.rolledDice.push({
    color: rolledDiceColor,
    number: rolledDiceNumber,
    player: currentPlayer,
  });

  currentState.players[currentPlayer]["legs"][currentLeg]["rolls"] += 1;

  var camelColor = bwCamels.includes(rolledDiceColor)
    ? pickBlackOrWhiteCamel(track, rolledDiceColor)
    : rolledDiceColor;

  var [camelPosition, camelsToMove] = getCamelPositionAndStack(
    track,
    camelColor
  );
  if (camelPosition < 0) {
    throw new Error(`Something went wrong! ${camelColor} camel was not found`);
  }

  var movement = isColorCamel(camelColor)
    ? rolledDiceNumber
    : -1 * rolledDiceNumber;

  var newCamelPosition = camelPosition + movement;
  if (newCamelPosition > 15) {
    moveCamel(track, camelColor, camelPosition, null, null);
    scoreGame(currentState, camelsToMove);
  }

  var placeUnder = false;
  if (track[newCamelPosition]["tiles"].length > 0) {
    updatePlayerScoreDesertTile(currentState, newCamelPosition);
    if (track[newCamelPosition]["tiles"][0] === "+") {
      newCamelPosition += 1;
    } else {
      newCamelPosition -= 1;
      placeUnder = true;
    }
  }

  if (newCamelPosition > 15) {
    moveCamel(track, camelColor, camelPosition, null, null);
    scoreGame(currentState, camelsToMove);
  }

  moveCamel(track, camelColor, camelPosition, newCamelPosition, placeUnder);

  // need to see if they land on a desert tile which can
  // 1) impact position 2) impact coins
  // track[newCamelPosition] = rolledDiceColor // need to add other camels too
  if (currentState.rounds[currentState.currentLeg].remainingDice.length === 1) {
    console.log("NEW LEG!!!");
    var [winnerCamel, runnerUpCamel] = getWinnerRunnerUp(currentState);
    scoreLeg(currentState, winnerCamel, runnerUpCamel);
    newLeg(currentState);
  }
}

function getWinnerRunnerUpLoser(currentState, camelsToMove) {
  var winnerCamel = null;
  var runnerUpCamel = null;
  var loserCamel = null;
  while (camelsToMove.length > 0) {
    var camel = camelsToMove.pop();
    if (colorCamels.includes(camel)) {
      if (!winnerCamel) {
        winnerCamel = camel;
      } else if (!runnerUpCamel) {
        runnerUpCamel = camel;
      } else {
        loserCamel = camel;
      }
    }
  }
  if (!runnerUpCamel) {
    var dummy = (null[(runnerUpCamel, dummy)] = getWinnerRunnerUp(
      currentState
    ));
  }
  if (!loserCamel) {
    loserCamel = getLoserCamel(currentState);
  }
  return [winnerCamel, runnerUpCamel, loserCamel];
}

function scoreGame(currentState, camelsToMove) {
  const [winnerCamel, runnerUpCamel, loserCamel] = getWinnerRunnerUpLoser(
    currentState,
    camelsToMove
  );
  console.log(
    `Winner camel is ${winnerCamel}. Runner up is ${runnerUpCamel}. Loser is ${loserCamel}`
  );
  scoreLeg(currentState, winnerCamel, runnerUpCamel);

  // sum up leg scores
  var scores = {};
  for (var i = 0; i < currentState.numberPlayers; i++) {
    var playerLegScore = 0;
    var currentPlayer = currentState["players"][i + 1];
    console.log("scoring, currentPlayerState", currentPlayer);
    for (var j = 0; j <= currentState.currentLeg; j++) {
      playerLegScore += currentPlayer["legs"][j]["score"];
    }
    scores[i] = playerLegScore;
  }

  var payoffs = [8, 5, 3, 2]; // everyone gets at least 1
  for (o in gameState.longRaceBets) {
    if (o.color == winnerCamel) {
      scores[o.player] += payoffs.length > 0 ? payoffs.shift() : 1;
    } else {
      scores[o.player] -= 1;
    }
  }

  payoffs = [8, 5, 3, 2]; // everyone gets at least 1
  for (o in gameState.shortRaceBets) {
    if (o.color == loserCamel) {
      scores[o.player] += payoffs.length > 0 ? payoffs.shift() : 1;
    } else {
      scores[o.player] -= 1;
    }
  }

  throw new Error(`Game over with scores ${scores}`);
}

function updatePlayerScoreDesertTile(currentState, camelPosition) {
  var foundTileOwner = false;
  for (var i = 0; i < currentState.numberPlayers; i++) {
    var desertTile =
      currentState.players[i + 1]["legs"][currentState.currentLeg].desertTile;
    if (Math.abs(desertTile) == camelPosition) {
      currentState.players[i + 1]["legs"][currentState.currentLeg][
        "score"
      ] += 1;
      foundTileOwner = true;
    }
  }
  if (!foundTileOwner) {
    throw new Error(`No player found for tile on space ${camelPosition}`);
  }
}

function getWinnerRunnerUp(currentState) {
  var winnerCamel = null;
  var runnerUpCamel = null;
  var track = currentState.track;

  for (var i = Object.keys(track).length - 1; i >= 0; i--) {
    for (var j = track[i]["camels"].length - 1; j >= 0; j--) {
      var foundColorCamel = colorCamels.includes(track[i]["camels"][j]);
      if (foundColorCamel) {
        if (!winnerCamel) {
          winnerCamel = track[i]["camels"][j];
        } else if (!runnerUpCamel) {
          runnerUpCamel = track[i]["camels"][j];
          break;
        }
      }
    }
  }

  return [winnerCamel, runnerUpCamel];
}

function getLoserCamel(currentState) {
  var track = currentState.track;

  for (var i = 0; i < Object.keys(track).length; i++) {
    for (var j = 0; j < track[i]["camels"].length; j++) {
      if (colorCamels.includes(track[i]["camels"][j])) {
        return track[i]["camels"][j];
      }
    }
  }
}

function scoreLeg(currentState, winnerCamel, runnerUpCamel) {
  // add the scoring
  for (var i = 0; i < currentState.numberPlayers; i++) {
    var playerPosition =
      currentState.players[i + 1]["legs"][currentState.currentLeg];
    var score = playerPosition.score;
    score += playerPosition.rolls;
    for (let k in playerPosition.legBets) {
      if (k === winnerCamel) {
        score += _.sum(playerPosition.legBets[k]);
      } else if (k === runnerUpCamel) {
        score += playerPosition.legBets[k].length;
      } else {
        score -= playerPosition.legBets[k].length;
      }
    }
    currentState.players[i + 1]["legs"][currentState.currentLeg][
      "score"
    ] = Math.max(score, 0); // can't go negative
  }
}

function newLeg(currentState) {
  currentState.remainingDice = [
    "red",
    "green",
    "blue",
    "purple",
    "yellow",
    "bw",
  ];

  var track = currentState.track;
  // clear desert tiles from track
  for (var i = Object.keys(track).length - 1; i >= 0; i--) {
    track[i]["tiles"] = [];
  }

  currentState.currentLeg += 1;

  for (var i = 0; i < currentState.numberPlayers; i++) {
    currentState.players[i + 1]["legs"][currentState.currentLeg] = _.cloneDeep(
      initialPlayerLegState
    );
  }

  currentState.remainingLegBets = _.cloneDeep(initialLegBets);
}

var initialPlayerLegState = {
  legBets: {
    red: [],
    purple: [],
    blue: [],
    green: [],
    yellow: [],
  },
  partner: [],
  rolls: 0,
  desertTile: -100, // -100 means unused
  score: 0,
};

var initialPlayerState = {
  cookie: "",
  screenName: "",
  legs: {
    0: _.cloneDeep(initialPlayerLegState),
  },
};

var initialTrackState = {
  camels: [],
  tiles: [],
};

var initialLegBets = {
  red: [2, 2, 3, 5],
  purple: [2, 2, 3, 5],
  blue: [2, 2, 3, 5],
  green: [2, 2, 3, 5],
  yellow: [2, 2, 3, 5],
};

var initialRoundState = {
  remainingLegBets: _.cloneDeep(initialLegBets),
  remainingDice: ["red", "green", "blue", "purple", "yellow", "bw"],
  rolledDice: [],
};

var initialGameState = {
  numberPlayers: 0,
  currentPlayer: "1",
  currentLeg: 0,
  started: false, // If started, new players cannot be added
  longRaceBets: [],
  shortRaceBets: [],
  rounds: {
    0: _.cloneDeep(initialRoundState),
  },
  players: {},
  track: {
    0: {
      camels: ["red"],
      tiles: [],
    },
    1: {
      camels: ["green", "blue"], // blue on top of green
      tiles: [],
    },
    2: {
      camels: ["purple", "yellow"], // yellow on top of purple
      tiles: [],
    },
    3: {
      camels: [],
      tiles: [],
    },
    4: _.cloneDeep(initialTrackState),
    5: _.cloneDeep(initialTrackState),
    6: _.cloneDeep(initialTrackState),
    7: _.cloneDeep(initialTrackState),
    8: _.cloneDeep(initialTrackState),
    9: _.cloneDeep(initialTrackState),
    10: _.cloneDeep(initialTrackState),
    11: _.cloneDeep(initialTrackState),
    12: _.cloneDeep(initialTrackState),
    13: _.cloneDeep(initialTrackState),
    14: {
      camels: ["black"],
      tiles: [],
    },
    15: {
      camels: ["white"],
      tiles: [],
    },
  },
  events: [],
};

export function getInitialGameState() {
  return _.cloneDeep(initialGameState);
}

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
    type: "placeDesertTile",
    player: "3",
    data: {
      desertTileIndex: 3,
      desertTileSide: "mirage",
    },
  },
  {
    type: "rollDice",
    player: "1",
  },
  {
    type: "makeRaceBet",
    player: "1",
    data: {
      kind: "long",
      color: "red",
    },
  },
];

// var gameState = initialGameState;
// for (var i = 0; i < events.length; i++) {
//     reduceEvent(gameState, events[i])
//     console.log(util.inspect(gameState, {showHidden: false, depth: null}))
// }
