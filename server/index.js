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

const gameState = getInitialGameState();
const gameObservers = {};
const cookies = {};
const registerGameObserver = (callback) => {
  const id = uuidv4();
  gameObservers[id] = { callback };
  return id;
};
const issueUpdate = () => {
  for (const o of Object.values(gameObservers)) {
    const players = (o.cookie && cookies[o.cookie].players) || [];
    o.callback(redactGameState(gameState, players));
  }
};
const registerCookie = (id, cookie) => {
  console.log("registering cookie");
  if (!(cookie in cookies)) {
    console.log("making new player");
    const player = makeNewPlayer(gameState);
    cookies[cookie] = { players: [player] };
  }
  gameObservers[id].cookie = cookie;
  issueUpdate();
};
const start = () => {
  startGame();
  issueUpdate();
};
const processEvent = (event) => {
  console.log(`processing`, event, gameState);
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
    registerCookie(id, cookie);
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
