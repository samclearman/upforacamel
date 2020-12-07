import _ from "lodash"
import util from "util"
import { isContext } from "vm"

function reduceEvent(currentState, event) {
    var currentPlayer = event.player
    validateEvent(currentState, event)
    
    var legNumber = currentState.currentLeg
    switch(event.type) {
        case "makeLegBet":
            var selectedColor = event.data.color
            var payoff = currentState.remainingLegBets[selectedColor].pop()
            // add error handling if array is empty
            currentState.players[currentPlayer]["legs"][legNumber]["legBets"][selectedColor].push(payoff)
            break;
        case "rollDice":
            var rolledDiceColor = currentState.remainingDice[Math.floor(Math.random() * currentState.remainingDice.length)];
            var rolledDiceNumber = [1, 2, 3][Math.floor(Math.random(3))]
            currentState.players[currentPlayer]["legs"][legNumber]["rolls"] += 1
            updateCamelPosition(currentState.tiles, rolledDiceColor, rolledDiceNumber)
            // check if leg is over
            // check if game is over
            break;
        case "placeDesertTile":
            var desertTileIndex = event.data.desertTileIndex
            var isOasis = event.data.desertTileSide === "oasis"
            updateTilePosition(currentState.tiles, desertTileIndex, isOasis)
            break;
        case "makeRaceBet":
            break;
        case "pickPartner":
            break;
        
    }
    // 1-indexed
    currentState.currentPlayer = (parseInt(currentState.currentPlayer) % currentState.numberPlayers + 1).toString()
}

function validateEvent(currentState, event) {
    var currentPlayer = event.player
    if (currentPlayer !== currentState.currentPlayer) {
        throw new Error(`Player ${currentPlayer} acted out of turn. It is player ${currentState.currentPlayer}'s turn.`)
    }
    // validate stuff
}

function updateTilePosition(tiles, desertTileIndex, isOasis) {
    // tile cannot already contain a desert tile
    if (tiles[desertTileIndex]["tiles"].length > 0) {
        throw new Error('Invalid move. There is already a desert tile here.')
    }
    tiles[desertTileIndex]["tiles"].push(isOasis ? "+" : "-")
}

function updateCamelPosition(tiles, rolledDiceColor, rolledDiceNumber) {
    console.log(`rolled dice color ${rolledDiceColor} and number ${rolledDiceNumber}`)
    
    var currentCamelPosition = -1
    var camelsToMove = null
    for (var i = 0; i < Object.keys(tiles).length; i++) {
        if (tiles[i]["camels"].includes(rolledDiceColor)) {
            currentCamelPosition = i

            var camelIndex = tiles[i]["camels"].indexOf(rolledDiceColor);
            camelsToMove = tiles[i]["camels"].slice(camelIndex)
            tiles[i]["camels"] = tiles[i]["camels"].slice(0, camelIndex)
        }
    }
    if (currentCamelPosition < 0) {
        throw new Error(`Something went wrong! ${rolledDiceColor} camel was not found`)
    }

    var newCamelPosition = currentCamelPosition + rolledDiceNumber
    if (newCamelPosition > 15) {
        throw new Error('game is over but we havent implemented yet')
    }

    var placeUnder = false
    if (tiles[newCamelPosition]["tiles"].length > 0) {
        if (tiles[newCamelPosition]["tiles"][0] === "+") {
            newCamelPosition += 1
        } else {
            newCamelPosition -= 1
            placeUnder = true
        }
    }

    if (!placeUnder) {
        tiles[newCamelPosition]["camels"] = tiles[newCamelPosition]["camels"].concat(camelsToMove)
    } else {
        tiles[newCamelPosition]["camels"] = tiles[newCamelPosition]["camels"].unshift(camelsToMove)
    }

    if (newCamelPosition > 15) {
        throw new Error('game is over but we havent implemented yet')
    }
    // tiles[i]

    // need to see if they land on a desert tile which can
    // 1) impact position 2) impact coins
    // tiles[newCamelPosition] = rolledDiceColor // need to add other camels too

}

var initialPlayerState = {
    "legs": {
        "0": {
            "legBets": {
                "red": [],
                "purple": [],
                "blue": [],
                "green": [],
                "yellow": [],
            },
            "partner": [],
            "rolls": 0,
            "desertTile": -1, // -1 means unused
        }
    },
    "raceBets": {
        "long": [],
        "short": [],
        "remaining": ["red", "purple", "blue", "green", "yellow"]
    },
}

var initialTileState = {
    "camels": [],
    "tiles": [],
}

var initialGameState = {
    "numberPlayers": 3,
    "currentPlayer": "1",
    "currentLeg": 0,
    "remainingLegBets": {
        "red": [2,2,3,5],
        "purple": [2,2,3,5],
        "blue": [2,2,3,5],
        "green": [2,2,3,5],
        "yellow": [2,2,3,5],
    },
    "remainingDice": ["red", "green", "blue", "purple", "yellow"],
    "players": {
        "1": _.cloneDeep(initialPlayerState),
        "2": _.cloneDeep(initialPlayerState),
        "3": _.cloneDeep(initialPlayerState),
        // "4": _.cloneDeep(initialPlayerState),
        // "5": _.cloneDeep(initialPlayerState),
        // "6": _.cloneDeep(initialPlayerState),
    },
    "tiles": {
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
        4: _.cloneDeep(initialTileState),
        5: _.cloneDeep(initialTileState),
        6: _.cloneDeep(initialTileState),
        7: _.cloneDeep(initialTileState),
        8: _.cloneDeep(initialTileState),
        9: _.cloneDeep(initialTileState),
        10: _.cloneDeep(initialTileState),
        11: _.cloneDeep(initialTileState),
        12: _.cloneDeep(initialTileState),
        13: _.cloneDeep(initialTileState),
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

var events = [
    {
        "type": "makeLegBet",
        "player": "1",
        "data": {
            "color": "yellow"
        },
    },
    {
        "type": "makeLegBet",
        "player": "2",
        "data": {
            "color": "yellow"
        }
    },
    {
        "type": "makeLegBet",
        "player": "3",
        "data": {
            "color": "yellow"
        }
    },
    {
        "type": "makeLegBet",
        "player": "1",
        "data": {
            "color": "yellow"
        }
    },
    {
        "type": "placeDesertTile",
        "player": "2",
        "data": {
            "desertTileIndex": 3,
            "desertTileSide": "oasis"
        }
    },
    {
        "type": "rollDice",
        "player": "3",
    },
    {
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
    },
]

var gameState = initialGameState
for (var i = 0; i < events.length; i++) {
    reduceEvent(gameState, events[i])
    console.log(util.inspect(gameState, {showHidden: false, depth: null}))
}


