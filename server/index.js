import { createServer } from "http";
import { Server } from "socket.io";
import {
  getInitialGameState,
  makeNewPlayerIfNeeded,
  startGame,
  reduceEvent,
} from "./reducer.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

var gameState = getInitialGameState();
var gameObservers = [];
var registerGameObserver = (callback) => {
  gameObservers.push(callback);
}
var issueUpdate = () => {
  for (const o of gameObservers) {
    o(gameState);
  }
}
var newPlayer = (cookie) => {
  makeNewPlayerIfNeeded(gameState, cookie);
  issueUpdate();
}
var start = () => {
  startGame();
  issueUpdate();
}
var processEvent = (event) => {
  reduceEvent(gameState, event);
  issueUpdate();
}

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  registerGameObserver((newState) => {
    socket.emit("game_state", { ...newState, longRaceBets: null, shortRaceBets: null});
  });

  socket.on("new_user", (socketId) => {
    console.log("got new user with id ", socketId);
  });

  socket.on("start_game", () => {
    start()
  });

  socket.on("register_cookie", ({ cookie }) => {
    console.log("register cookie ", cookie);
    newPlayer(cookie);
  });

  socket.on("event", (event) => {
    console.log("got event ", event);
    processEvent(event);
    console.log("new game state");
    // console.log(util.inspect(gameState, {showHidden: false, depth: null}))
  });

  socket.emit("game_state", gameState);

});

httpServer.listen(3030);
