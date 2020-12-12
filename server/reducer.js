import _ from "lodash"
import util from "util"

export function reduceEvent(currentState, event) {
    validateEvent(currentState, event)
    
    var currentPlayer = event.player 
    var currentLeg = currentState.currentLeg
    switch(event.type) {
        case "makeLegBet":
            var selectedColor = event.data.color
            if (currentState.remainingLegBets[selectedColor].length === 0) {
                throw new Error("no more leg bets for color")
            }
            var payoff = currentState.remainingLegBets[selectedColor].pop()
            // add error handling if array is empty
            currentState.players[currentPlayer]["legs"][currentLeg]["legBets"][selectedColor].push(payoff)
            break;
        case "rollDice":
            updateCamelPosition(currentState, event)
            break;
        case "placeDesertTile":
            updateTilePosition(currentState, event)
            break;
        case "makeOverallRaceBet":
            updateOverallRaceBet(currentState, event)
            break;
        case "pickPartner":
            break;
        
    }
    // 1-indexed
    currentState.currentPlayer = (parseInt(currentState.currentPlayer) % currentState.numberPlayers + 1).toString()
}

function validateEvent(currentState, event) {
    var track = currentState.track
    var currentLeg = currentState.currentLeg

    var currentPlayer = event.player

    if (currentPlayer !== currentState.currentPlayer) {
        throw new Error(`Player ${currentPlayer} acted out of turn. It is player ${currentState.currentPlayer}'s turn.`)
    }
    switch(event.type) {
        case "makeLegBet":
            // add error handling if array is empty
            break;
        case "rollDice":
            // todo
            break;
        case "placeDesertTile":
            var desertTileIndex = event.data.desertTileIndex
            var existingDesertTile = currentState["players"][currentPlayer]["legs"][currentLeg]["desertTile"]
            
            // there are no other users' tiles on +/- 1 of this spot
            if (track[desertTileIndex]["tiles"].length > 0 && Math.abs(existingDesertTile) !== desertTileIndex) {
                throw new Error('Invalid move. There is already another user\'s desert tile here.')
            }
            if (desertTileIndex + 1 < 16 && track[desertTileIndex + 1]["tiles"].length > 0 && Math.abs(existingDesertTile) !== desertTileIndex + 1) {
                throw new Error('Invalid move. There is already an adjacent desert tile.')
            }
            if (desertTileIndex - 1 > 0 && track[desertTileIndex - 1]["tiles"].length > 0 && Math.abs(existingDesertTile) !== desertTileIndex - 1) {
                throw new Error('Invalid move. There is already an adjacent desert tile.')
            }

            // if user is already already there, they must flip the tile side
            if (existingDesertTile > 0 && event.data.desertTileSide === "oasis") {
                throw new Error('User already has an oasis desert tile here')
            } else if (existingDesertTile < 0 && event.data.desertTileSide === "mirage") {
                throw new Error('User already has an mirage desert tile here')
            }

            break;
        case "makeOverallRaceBet":
            var color = event.data.color

            // player cannot make bet if they already made bet
            var raceBets = currentState["players"][currentPlayer]["raceBets"]
            if (raceBets["long"].includes(color) || raceBets["short"].includes(color)) {
                throw new Error("you have already made a bet with this color")
            }
            break;
        case "pickPartner":
            break;
        
    }
}

function updateOverallRaceBet(currentState, event) {
    var kind = event.data.kind
    var color = event.data.color
    var currentPlayer = event.player

    currentState["players"][currentPlayer]["raceBets"][kind].push(color)

    var category = (kind === "long") ? "overallLongBets" : "overallShortBets"
    currentState[category].push(color)
}

function updateTilePosition(currentState, event) {
    var track = currentState.track
    var currentLeg = currentState.currentLeg
    var currentPlayer = event.player

    var existingDesertTile = currentState["players"][currentPlayer]["legs"][currentLeg]["desertTile"]

    var desertTileIndex = event.data.desertTileIndex
    var isOasis = event.data.desertTileSide === "oasis"
    var player = event.player

    if (existingDesertTile !== -100) {
        track[Math.abs(existingDesertTile)]["tiles"] = []
    }
    track[desertTileIndex]["tiles"] = [isOasis ? "+" : "-"]
    currentState["players"][player]["legs"][currentLeg]["desertTile"] = desertTileIndex
}

var colorCamels = ["red", "blue", "purple", "yellow", "green"]
var bwCamels = ["black", "white"]

function isColorCamel(color) {
    return colorCamels.includes(color) 
}

function updateCamelPosition(currentState, event) {
    var rolledDiceColor = currentState.remainingDice[Math.floor(Math.random() * currentState.remainingDice.length)];
    var rolledDiceNumber = [1, 2, 3][Math.floor(Math.random() * 3)]
    currentState.remainingDice = currentState.remainingDice.filter(item => item !== rolledDiceColor)
    var currentPlayer = event.player
    var currentLeg = currentState.currentLeg
    var track = currentState.track

    currentState.players[currentPlayer]["legs"][currentLeg]["rolls"] += 1

    console.log(`rolled dice color ${rolledDiceColor} and number ${rolledDiceNumber}`)
    
    var currentCamelPosition = -1
    var camelsToMove = null

    // todo: if black/white, then only move camel that is carrying 
    // also, black/white can't carry each other
    for (var i = 0; i < Object.keys(track).length; i++) {
        if (track[i]["camels"].includes(rolledDiceColor)) {
            currentCamelPosition = i

            var camelIndex = track[i]["camels"].indexOf(rolledDiceColor);
            camelsToMove = track[i]["camels"].slice(camelIndex)
            track[i]["camels"] = track[i]["camels"].slice(0, camelIndex)
        }
    }
    if (currentCamelPosition < 0) {
        throw new Error(`Something went wrong! ${rolledDiceColor} camel was not found`)
    }

    var movement = isColorCamel(rolledDiceColor) ? rolledDiceNumber : -1 * rolledDiceNumber

    var newCamelPosition = currentCamelPosition + movement
    if (newCamelPosition > 15) {
        scoreGame(currentState, camelsToMove)
    }

    var placeUnder = false
    if (track[newCamelPosition]["tiles"].length > 0) {
        updatePlayerScoreDesertTile(currentState, newCamelPosition)
        if (track[newCamelPosition]["tiles"][0] === "+") {
            newCamelPosition += 1
        } else {
            newCamelPosition -= 1
            placeUnder = true
        }
    }

    if (!placeUnder) {
        track[newCamelPosition]["camels"] = track[newCamelPosition]["camels"].concat(camelsToMove)
    } else {
        track[newCamelPosition]["camels"] = camelsToMove.concat(track[newCamelPosition]["camels"])
    }

    if (newCamelPosition > 15) {
        scoreGame(currentState, camelsToMove)
    }

    // need to see if they land on a desert tile which can
    // 1) impact position 2) impact coins
    // track[newCamelPosition] = rolledDiceColor // need to add other camels too
    if (currentState.remainingDice.length === 1) {
        console.log("NEW LEG!!!")
        var winningCamel, runnerUpCamel = getWinnerRunnerUp(currentState)
        scoreLeg(currentState, winningCamel, runnerUpCamel)
        newLeg(currentState)
    }
}

function scoreGame(currentState, camelsToMove) {
    var winningCamel = camelsToMove.pop()
    var runnerUpCamel = null
    var dummy
    if (camelsToMove.length > 0) {
        var runnerUpCamel = camelsToMove.pop()
    } else {
        runnerUpCamel, dummy = getWinnerRunnerUp(currentState)
    }

    scoreLeg(currentState, winningCamel, runnerUpCamel)

    // sum up leg scores
    var scores = {}
    for (var i = 0; i < currentState.numberPlayers; i++) {
        var playerLegScore = 0
        var currentPlayer = currentState["players"][i + 1]
        console.log("scoring, currentPlayerState", currentPlayer)
        for (var j = 0; j <= currentState.currentLeg; j++) {
            playerLegScore += currentPlayer["legs"][j]["score"]
        }
        scores[i] = playerLegScore
    }
    console.log(scores)

    throw new Error("Game over")
    // sum up long term scores
}

function updatePlayerScoreDesertTile(currentState, camelPosition) {
    var foundTileOwner = false
    for (var i = 0; i < currentState.numberPlayers; i++) {
        var desertTile = currentState.players[i+1]["legs"][currentState.currentLeg].desertTile
        if (Math.abs(desertTile) == camelPosition) {
            currentState.players[i+1]["legs"][currentState.currentLeg]["score"] += 1
            foundTileOwner = true
        }
    }
    if (!foundTileOwner) {
        throw new Error(`No player found for tile on space ${camelPosition}`)
    }
}

function getWinnerRunnerUp(currentState) {
    var winningCamel = null
    var runnerUpCamel = null
    var track = currentState.track

    for (var i = Object.keys(track).length - 1; i >= 0; i--) {
        for (var j = track[i]["camels"].length - 1; j >=0; j--) {
            var foundColorCamel = colorCamels.includes(track[i]["camels"][j])
            if (foundColorCamel) {
                if (!winningCamel) {
                    winningCamel = track[i]["camels"][j]
                } else if (!runnerUpCamel) {
                    runnerUpCamel = track[i]["camels"][j]
                    break;
                }
            }
        }
    }

    return winningCamel, runnerUpCamel
}

function scoreLeg(currentState, winningCamel, runnerUpCamel) {
    // var winningCamel, runnerUpCamel = getWinnerRunnerUp(currentState)
    // add the scoring
    for (var i = 0; i < currentState.numberPlayers; i++) {
        var playerPosition = currentState.players[i+1]["legs"][currentState.currentLeg]
        var score = playerPosition.score
        score += playerPosition.rolls
        for (let k in playerPosition.legBets) {
            if (k === winningCamel) {
                score += _.sum(playerPosition.legBets[k])
            } else if (k === runnerUpCamel) {
                score += playerPosition.legBets[k].length
            } else {
                score -= playerPosition.legBets[k].length
            }
        }
        currentState.players[i+1]["legs"][currentState.currentLeg]["score"] = score
    }
}

function newLeg(currentState) {
    currentState.remainingDice = ["red", "green", "blue", "purple", "yellow", "black", "white"]

    var track = currentState.track
    // clear desert tiles from track
    for (var i = Object.keys(track).length - 1; i >= 0; i--) {
        track[i]["tiles"] = []
    }

    currentState.currentLeg += 1

    for (var i = 0; i < currentState.numberPlayers; i++) {
        currentState.players[i+1]["legs"][currentState.currentLeg] =  _.cloneDeep(initialPlayerLegState)
    }

    currentState.remainingLegBets =  _.cloneDeep(initialLegBets)
}

var initialPlayerLegState = {
    "legBets": {
        "red": [],
        "purple": [],
        "blue": [],
        "green": [],
        "yellow": [],
    },
    "partner": [],
    "rolls": 0,
    "desertTile": -100, // -100 means unused
    "score": 0,
}

var initialPlayerState = {
    "legs": {
        "0": _.cloneDeep(initialPlayerLegState)
    },
    "raceBets": {
        "long": [],
        "short": [],
    },
}

var initialTrackState = {
    "camels": [],
    "tiles": [],
}

var initialLegBets = {
    "red": [2,2,3,5],
    "purple": [2,2,3,5],
    "blue": [2,2,3,5],
    "green": [2,2,3,5],
    "yellow": [2,2,3,5],
}

var initialGameState = {
    "numberPlayers": 3,
    "currentPlayer": "1",
    "currentLeg": 0,
    "overallLongBets": [],
    "overallShortBets": [],
    "remainingLegBets": _.cloneDeep(initialLegBets),
    "remainingDice": ["red", "green", "blue", "purple", "yellow", "black", "white"],
    "players": {
        "1": _.cloneDeep(initialPlayerState),
        "2": _.cloneDeep(initialPlayerState),
        "3": _.cloneDeep(initialPlayerState),
        // "4": _.cloneDeep(initialPlayerState),
        // "5": _.cloneDeep(initialPlayerState),
        // "6": _.cloneDeep(initialPlayerState),
    },
    "track": {
        0: {
            "camels": ["red"],
            "tiles": [],
        },
        1: {
            "camels": ["green", "blue"], // blue on top of green
            "tiles": [],
        },
        2: {
            "camels": ["purple", "yellow"], // yellow on top of purple
            "tiles": [],
        },
        3: {
            "camels": [],
            "tiles": [],
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
            "camels": ["black"],
            "tiles": [],
        },
        15: {
            "camels": ["white"],
            "tiles": [],
        },
    },
    "events": []
}

export function getInitialGameState() {
    return _.cloneDeep(initialGameState)
}

function addDiceRolls(num) {
    var toReturn = []
    var array = [{
        "type": "rollDice",
        "player": "1",
    },
    {
        "type": "rollDice",
        "player": "2",
    },
    {
        "type": "rollDice",
        "player": "3",
    }]
    for (var i = 0; i < num; i++) {
        toReturn = toReturn.concat(array)
    }
    return toReturn
}
// var events = [
//     {
//         "type": "makeLegBet",
//         "player": "1",
//         "data": {
//             "color": "yellow"
//         },
//     },
//     {
//         "type": "placeDesertTile",
//         "player": "2",
//         "data": {
//             "desertTileIndex": 3,
//             "desertTileSide": "oasis"
//         }
//     },
//     {
//         "type": "makeLegBet",
//         "player": "3",
//         "data": {
//             "color": "yellow"
//         }
//     },
//     {
//         "type": "makeLegBet",
//         "player": "1",
//         "data": {
//             "color": "yellow"
//         }
//     },
//     {
//         "type": "placeDesertTile",
//         "player": "2",
//         "data": {
//             "desertTileIndex": 3,
//             "desertTileSide": "mirage"
//         }
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     },
//     {
//         "type": "rollDice",
//         "player": "1",
//     },
//     {
//         "type": "placeDesertTile",
//         "player": "2",
//         "data": {
//             "desertTileIndex": 10,
//             "desertTileSide": "mirage"
//         }
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     },
//     {
//         "type": "rollDice",
//         "player": "1",
//     },
//     {
//         "type": "rollDice",
//         "player": "2",
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     },
//     {
//         "type": "makeLegBet",
//         "player": "1",
//         "data": {
//             "color": "blue"
//         }
//     },
//     {
//         "type": "makeLegBet",
//         "player": "2",
//         "data": {
//             "color": "blue"
//         }
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     },
//     {
//         "type": "rollDice",
//         "player": "1",
//     },
//     {
//         "type": "rollDice",
//         "player": "2",
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     },
//     {
//         "type": "makeOverallRaceBet",
//         "player": "1",
//         "data": {
//             "kind": "long",
//             "color": "red"
//         }
//     },
//     {
//         "type": "rollDice",
//         "player": "2",
//     },
//     {
//         "type": "rollDice",
//         "player": "3",
//     }
// ]

var gameState = initialGameState


