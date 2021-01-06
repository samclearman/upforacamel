# Up for a camel

Web based implementation of [Camel Up](https://boardgamegeek.com/boardgame/260605/camel-second-edition)

The game consists of two programs, a Node server and an HTML5 client.  For ease of deployment, the server is set up to serve the client when run in production.  In development it's better to serve the client seperately (with the create-react-app dev server) so that you can have hot reloading.

To set up a dev instance:

1. `cd server && npm install && npm start`
2. `cd client && npm install && npm start`
