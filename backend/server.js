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

//##########
//##config##
//##########

const CONFIG_PATH = path.join(__dirname, "config.json");


const defaultConfig = {
    serverStartProperties: "-Dfile.encoding=UTF-8 -Xmx8G -jar server.jar -nogui",
    serverPath: "",
    javaPath: "java"
};

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}


app.get("/settings", (req, res) => {
    res.json(loadConfig());
});

app.post("/settings", (req, res) => {
    saveConfig(req.body);
    res.json({status: "saved"});
});

//##########
//##server##
//##########

function startMinecraftServer(wsBroadcast = true) {
    if (mcServer) return false;

    const config = loadConfig();
    const serverDir = path.resolve(config.serverPath);
    const args = config.serverStartProperties.split(" ");


    mcServer = spawn(
        config.javaPath, args,
        {
            cwd: serverDir,
            windowsHide: true
        }
    );

    const iconv = require("iconv-lite");

    const encoding = process.platform === "win32" ? "win1251" : "utf-8";

    mcServer.stdout.on("data", (data) => {
        const output = iconv.decode(data, encoding);
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
        const output = iconv.decode(data, encoding);
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



    mcServer.once("exit", () => {
        console.log("exit event fired, restarting...");
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




