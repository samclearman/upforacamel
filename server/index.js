import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  getInitialGameState,
  makeNewPlayer,
  startGame,
  reduceEvent,
  redactGameState,
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
    o.callback(redactGameState(games[gameId].state, players));
  }
};

const registerCookie = (observerId, cookie) => {
  console.log("registering cookie");
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  const cookies = game.cookies;
  if (!(cookie in cookies)) {
    console.log("making new player");
    const player = makeNewPlayer(game.state);
    cookies[cookie] = { players: [player] };
  }
  game.observers[observerId].cookie = cookie;
  issueUpdate(gameId);
};

const start = (gameId) => {
  console.log(`starting game ${gameId}!`);
  startGame(games[gameId].state);
  issueUpdate(gameId);
};

const processEvent = (observerId, event) => {
  console.log(`processing`, event);
  const gameId = gameObservers[observerId];
  const game = games[gameId];
  reduceEvent(game.state, event);
  issueUpdate(gameId);
};

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on("join", ({ gameId, cookie }) => {
    let observerId = registerGameObserver(gameId, (newState) => {
      socket.emit("game_state", newState);
    });

    registerCookie(observerId, cookie);

    console.log(`got id ${gameId}`);

    socket.on("start_game", ({ gameId }) => {
      start(gameId);
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
