const {spawn} = require("child_process");
const WebSocket = require("ws");
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
let mcServer = null;

const server = require("http").createServer(app);
const wss = new WebSocket.Server({server});


function startMinecraftServer(wsBroadcast = true) {
    if (mcServer) return false;

    // const serverDir = path.resolve("D:/Server/Server Minecraft/");
    // const serverDir = path.resolve("D:/Server/ServerNew");
    // const serverDir = path.resolve("C:/Users/Admin/Desktop/ServerNew");
    //   const serverDir = path.resolve("C:/Users/Admin/Desktop/visivanie")
    //   const serverDir = path.resolve("C:/Users/Admin/Desktop/serverparkur");
    const serverDir = path.resolve("C:/Users/Admin/Desktop/aiserver");
    mcServer = spawn(
        "java",
        [
            "-Dfile.encoding=UTF-8",
            "-Xmx8G",
            "-jar",
            "server.jar",
            "-nogui"
        ],
        {
            cwd: serverDir,
            windowsHide: true
        }
    );


    const iconv = require("iconv-lite");

    mcServer.stdout.on("data", (data) => {
        const output = iconv.decode(data, "win1251");
        console.log("STDOUT:", output);
        if (wsBroadcast) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(output);
                }
            });
        }
    });

    mcServer.stderr.on("data", (data) => {
        const output = iconv.decode(data, "win1251");
        console.error("STDERR:", output);
        if (wsBroadcast) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("Error: " + output);
                }
            });
        }
    });

    mcServer.on("exit", () => {
        console.log("Minecraft server has stopped");
        mcServer = null;
    });

    return true;
}

app.post("/start-server", (req, res) => {
    console.log("Received request to start server");
    const started = startMinecraftServer(true);
    if (started) {
        res.json({status: "Server started"});
    } else {
        res.status(400).json({error: "Server is already running"});
    }
});


app.post("/restart-server", (req, res) => {
    if (!mcServer) {
        return res.status(400).json({error: "Server is not running"});
    }

    mcServer.on("exit", () => {
        startMinecraftServer(true);
    });

    mcServer.stdin.write("stop\n");
    res.json({status: "Restarting..."});
});


wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        if (mcServer) {
            mcServer.stdin.write(message + "\n");
        } else {
            ws.send("Server is not running");
        }
    });
});


app.get('/status', (req, res) => {
    res.json({status: mcServer ? 'online' : 'offline'});
    res.json
})


server.listen(3000, () => console.log("WebSocket server running on port 3000"));




