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

function camelToNumber(camelColor) {
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
  }
}

function tileToNumber(tileSymbol) {
  switch (tileSymbol) {
    case "+":
      return 1;
    case "-":
      return -1;
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
  if (!gameState) {
    return [];
  }
  return Object.entries(gameState.players).map(([n, p]) => {
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
      money = gameState.finalScore[n] || 0;
    }
    return { name: p.displayName, money, bets };
  });
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
