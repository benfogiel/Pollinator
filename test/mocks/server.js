// eslint-disable-next-line
const { WebSocketServer } = require("ws");

const port = 81;

const server = new WebSocketServer({ port: port });

server.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Server received: ${message}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    ws.send("Welcome to the mock WebSocket server!");
});

console.log(`Mock WebSocket server is running on ws://localhost:${port}`);
