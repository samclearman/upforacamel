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

var gameState = getInitialGameState();
var gameObservers = {};
var cookies = {};
var registerGameObserver = (callback) => {
  const id = uuidv4();
  gameObservers[id] = { callback };
  return id;
};
var issueUpdate = () => {
  for (const o of Object.values(gameObservers)) {
    o.callback(redactGameState(gameState, o.player));
  }
};
var registerCookie = (id, cookie) => {
  if (cookie in cookies) {
    const player = makeNewPlayer(gameState);
    cookies[cookie] = { players: [player] };
  }
  gameObservers.id.cookie = cookie;
  issueUpdate();
};
var start = () => {
  startGame();
  issueUpdate();
};
var processEvent = (event) => {
  reduceEvent(gameState, event);
  issueUpdate();
};

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  let id = registerGameObserver((newState) => {
    socket.emit("game_state", newState);
  });

  socket.on("start_game", () => {
    start();
  });

  socket.on("register_cookie", ({ cookie }) => {
    console.log("register cookie ", cookie);
    makePlayer(cookie);
  });

  socket.on("event", (event) => {
    console.log("got event ", event);
    try {
      processEvent(event);
    } catch (e) {
      console.log(e);
    }

    console.log("new game state");
  });

  socket.emit("game_state", gameState);
});

httpServer.listen(3030);
