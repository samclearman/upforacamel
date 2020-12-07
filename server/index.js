import { createServer } from "http";
import { Server } from "socket.io";
import { getInitialGameState, reduceEvent } from "./reducer.js"
import util from "util"

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});

var gameState = getInitialGameState()

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on("new_user", (socketId) => {
    console.log("got new user with id ", socketId);
  });

  socket.emit("game_state", gameState);

  socket.on("event", (event) => {
    console.log('got event ', event)
    reduceEvent(gameState, event)
    console.log('new game state')
    console.log(util.inspect(gameState, {showHidden: false, depth: null}))

    socket.emit("game_state_update", event);
  })

});

// io.on("new_user", (socketId) => {
//     console.log("got new user with id ", socketId);
// });

httpServer.listen(3030);
