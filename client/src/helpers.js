export function playerNumberToColor(n) {
  return [
    "lightblue",
    "lightcoral",
    "lightgoldenrodyellow",
    "lightgreen",
    "lightsalmon",
    "lightseagreen",
    "plum",
    "sandybrown",
  ][n - 1];
}

export function camelToNumber(camelColor) {
  switch (camelColor) {
    case "red":
      return 1;
    case "yellow":
      return 2;
    case "blue":
      return 3;
    case "green":
      return 4;
    case "purple":
      return 5;
    case "black":
      return -1;
    case "white":
      return -2;
    default:
      console.error("unknown camel color");
      return null;
  }
}

export function camelToColor(camelNumber) {
  switch (camelNumber) {
    case 1:
      return "red";
    case 2:
      return "yellow";
    case 3:
      return "blue";
    case 4:
      return "green";
    case 5:
      return "purple";
    case -1:
      return "black";
    case -2:
      return "white";
    default:
      console.error("unknown camel number");
      return null;
  }
}

export function camelToTextColor(camelNumber) {
  switch (camelNumber) {
    case 1:
      return "black";
    case 2:
      return "black";
    case 3:
      return "white";
    case 4:
      return "black";
    case 5:
      return "white";
    case -1:
      return "white";
    case -2:
      return "black";
    default:
      console.log(camelNumber);

      console.error("unknown camel number");
      return null;
  }
}

export function getPositions(gameState) {
  if (!gameState) {
    return [];
  }
  return Object.values(gameState.track).map((v) =>
    v.camels.map((c) => camelToNumber(c)).reverse()
  );
}

export function getFinishers(gameState) {
  if (!gameState) {
    return [];
  }
  return (gameState.finishers || []).map((c) => camelToNumber(c)).reverse();
}

export function getCrowds(gameState) {
  if (!gameState) {
    return [];
  }
  // return Object.values(gameState.track).map((v) =>
  //   v.tiles.length
  //     ? {
  //         player: 1,
  //         direction: tileToNumber(v.tiles[0]),
  //       }
  //     : null
  // );
  const crowds = [];
  for (let i = 0; i < 16; i++) {
    crowds.push(null);
    for (const n in gameState.players) {
      const v = Object.values(gameState.players[n].legs).slice(-1)[0]
        .desertTile;
      if (Math.abs(v) === i) {
        crowds[i] = { player: parseInt(n), direction: v ? v / Math.abs(v) : 1 };
      }
    }
  }
  return crowds;
}
export function getCurrentLeg(gameState) {
  return gameState.legs[gameState.currentLegNum];
}

export function getAvailableBets(gameState) {
  if (!gameState) {
    return [];
  }
  const bets = [];
  for (const c in getCurrentLeg(gameState).remainingLegBets) {
    bets[camelToNumber(c) - 1] = getCurrentLeg(gameState).remainingLegBets[
      c
    ].slice(-1)[0];
  }
  return bets;
}

export function getLongBets(gameState) {
  if (!gameState) {
    return { toLose: [], toWin: [] };
  }
  return {
    toLose: gameState.shortRaceBets.map((b) => ({
      player: parseInt(b.player),
      camel: camelToNumber(b.color),
    })),
    toWin: gameState.longRaceBets.map((b) => ({
      player: parseInt(b.player),
      camel: camelToNumber(b.color),
    })),
  };
}

export function getAvailableLongBets(gameState, player) {
  const placed = [].concat(
    gameState.players[player]?.raceBets?.longRaceBets || [],
    gameState.players[player]?.raceBets?.shortRaceBets || []
  );
  return [1, 2, 3, 4, 5].filter((n) => !placed.includes(camelToColor(n)));
}

export function getPlayers(gameState) {
  if (!(gameState && gameState.players)) {
    return [];
  }
  const players = [];
  for (const k in gameState.players) {
    const p = gameState.players[k];

    const lastLeg = Object.values(p.legs).slice(-1)[0];
    const bets = [];
    if (gameState.status === "inprogress") {
      for (const c in lastLeg.legBets) {
        for (const payout of lastLeg.legBets[c]) {
          bets.push({ camel: camelToNumber(c), payout });
        }
      }
    }
    let money = Object.values(p.legs)
      .map((leg) => leg.score || 0)
      .reduce((x, y) => x + y);
    if (gameState.finalScore) {
      money = gameState.finalScore[k] || 0;
    }
    players[parseInt(k) - 1] = { name: p.displayName, money, bets };
  }
  return players;
}

export function getRolls(gameState) {
  if (!gameState) {
    return [];
  }
  return getCurrentLeg(gameState).rolledDice.map(
    ({ color, number, player }) => ({
      camel: camelToNumber(color),
      number,
      player: parseInt(player),
    })
  );
}

export function getLegResults(gameState) {
  if (!gameState || !gameState.players) {
    return [];
  }

  const results = [];

  // Iterate through completed legs (all legs before current one)
  for (let legNum = 0; legNum < gameState.currentLegNum; legNum++) {
    const leg = gameState.legs[legNum];
    const winnerCamel = leg.winner;
    const runnerUpCamel = leg.runnerUp;

    const legResults = {
      legNumber: legNum + 1,
      winner: winnerCamel,
      runnerUp: runnerUpCamel,
      players: []
    };

    // Get results for each player in this leg
    for (const playerId in gameState.players) {
      const player = gameState.players[playerId];
      const legData = player.legs[legNum];

      if (!legData) continue;

      // Calculate detailed bet information
      const bets = [];
      let totalBetPoints = 0;

      for (const color in legData.legBets) {
        for (const betValue of legData.legBets[color]) {
          let payout = 0;
          let result = "lost";

          if (color === winnerCamel) {
            payout = betValue;
            result = "won";
            totalBetPoints += betValue;
          } else if (color === runnerUpCamel) {
            payout = 1;
            result = "second";
            totalBetPoints += 1;
          } else {
            payout = -1;
            result = "lost";
            totalBetPoints -= 1;
          }

          bets.push({
            color: color,
            betValue: betValue,
            payout: payout,
            result: result
          });
        }
      }

      const rollPoints = legData.rolls;
      const desertTilePoints = legData.desertTilePoints;

      legResults.players.push({
        playerId: parseInt(playerId),
        name: player.displayName,
        totalScore: legData.score,
        rollPoints: rollPoints,
        betPoints: totalBetPoints,
        desertTilePoints: desertTilePoints,
        bets: bets
      });
    }

    results.push(legResults);
  }

  return results;
}
