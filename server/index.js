import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  getInitialGameState,
  makeNewPlayer,
  startGame,
  reduceEvent,
  redactGameState,
  updateDisplayName,
} from "./reducer.js";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const games = {};
const gameObservers = {}; // id to game id

const registerGameObserver = (gameId, callback) => {
  const id = uuidv4();
  if (!games[gameId]) {
    games[gameId] = {
      state: getInitialGameState(),
      observers: [],
      cookies: [],
    };
  }
  games[gameId].observers[id] = { callback };
  gameObservers[id] = gameId;
  return id;
};
const issueUpdate = (gameId) => {
  for (const o of Object.values(games[gameId].observers)) {
    const players = (o.cookie && games[gameId].cookies[o.cookie].players) || [];
    o.callback({
      type: "game_state",
      data: redactGameState(games[gameId].state, players),
    });
  }
};

const issuePlayerUpdate = (observerId) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  const observer = game.observers[observerId];
  const cookie = game.cookies[observer.cookie];
  observer.callback({
    type: "player_assignment",
    data: { players: cookie.players },
  });
};

const registerCookie = (observerId, cookie) => {
  console.log("registering cookie");
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  const cookies = game.cookies;
  if (!(cookie in cookies)) {
    const player = makeNewPlayer(game.state);
    cookies[cookie] = { players: [player] };
  }
  game.observers[observerId].cookie = cookie;
  issuePlayerUpdate(observerId);
  issueUpdate(gameId);
};

const start = (gameId) => {
  console.log(`starting game ${gameId}!`);
  startGame(games[gameId].state);
  issueUpdate(gameId);
};

const processEvent = (observerId, event) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  reduceEvent(game.state, event);
  issueUpdate(gameId);
};

const changeName = (observerId, player, displayName) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  updateDisplayName(game.state, player, displayName);
  issueUpdate(gameId);
};

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on("join", ({ gameId, cookie }) => {
    let observerId = registerGameObserver(gameId, (observerEvent) => {
      socket.emit(observerEvent.type, observerEvent.data);
    });

    registerCookie(observerId, cookie);

    socket.on("start_game", ({ gameId }) => {
      start(gameId);
    });

    socket.on("change_name", ({ player, displayName }) => {
      changeName(observerId, player, displayName);
    });

    socket.on("event", (event) => {
      console.log("got event ", event);
      try {
        processEvent(observerId, event);
      } catch (e) {
        console.log(e);
      }

      console.log("new game state");
    });

    socket.emit("game_state", games[gameId].state);
  });
});

httpServer.listen(3030);
