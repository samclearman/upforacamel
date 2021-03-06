import { Server } from "http";
import express from "express";
import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  getInitialGameState,
  makeNewPlayer,
  startGame,
  reduceEvent,
  redactGameState,
  updateDisplayName,
  removePlayer,
} from "./reducer.js";

const app = express();
app.use(express.static("static"));

const server = Server(app);
console.log(`env: ${process.env.NODE_ENV}`);
const io = (process.env.NODE_ENV = "development"
  ? new SocketServer(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })
  : new SocketServer(server));

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
  issueUpdate(gameId);
  issuePlayerUpdate(observerId);
};

const start = (gameId) => {
  console.log(`starting game ${gameId}!`);
  startGame(games[gameId].state);
  issueUpdate(gameId);
};

const processEvent = (observerId, event) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  const cookie = game.observers[observerId].cookie;
  const coookie = game.cookies[cookie];
  if (event.player && !(coookie && coookie.players.includes(event.player))) {
    throw new Error("You arent that player you dirty dog");
  }

  reduceEvent(game.state, event);
  issueUpdate(gameId);
};

const changeName = (observerId, player, displayName) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  updateDisplayName(game.state, player, displayName);
  issueUpdate(gameId);
};

const remove = (observerId, player) => {
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  removePlayer(game.state, player);
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

    socket.on("remove_player", ({ player }) => {
      remove(observerId, player);
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
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT);
