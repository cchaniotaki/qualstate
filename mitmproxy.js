const fs = require('fs');
const {execFile} = require('child_process');
const net = require('net');
const {WebSocketServer} = require('ws');
const path = require('path');

require('dotenv').config();

class MitmproxyManager {
    constructor(mitmproxyPath, proxyPort, cachePath) {
        this.mitmproxyPath = mitmproxyPath;
        this.proxyPort = proxyPort;
        this.cachePath = cachePath;
        this.mitmproxyProcess = null;
        this.websocketServer = null;
    }

    startMitmproxy() {
        console.log("MitmproxyManager: Starting mitmproxy");

        // Ensure mitmproxyPath is executable
        if (!fs.existsSync(this.mitmproxyPath)) {
            throw new Error("mitmproxy executable not found at specified path");
        }
        fs.chmodSync(this.mitmproxyPath, '755');

        const cmd = [
            '--set', 'upstream_cert=false',
            '--set', 'server_replay_kill_extra=true',
            '--set', 'server_replay_nopop=true',
            '-S', this.cachePath,
            '-p', this.proxyPort.toString(),
            '--ssl-insecure'
        ];

        this.mitmproxyProcess = execFile(this.mitmproxyPath, cmd, {stdio: 'ignore'}, (err) => {
            if (err) console.error("Mitmproxy process error:", err);
        });

        return this.waitForPortInUse(this.proxyPort).then(() => {
            console.log(`MitmproxyManager: mitmproxy started on port ${this.proxyPort}`);
        });
    }

    stopMitmproxy() {
        if (this.mitmproxyProcess) {
            this.mitmproxyProcess.kill();
            console.log("MitmproxyManager: mitmproxy stopped");
        }
        process.exit(0);
    }

    waitForPortInUse(port, timeout = 60000) {
        return new Promise((resolve, reject) => {
            const interval = 100;
            const endTime = Date.now() + timeout;

            const checkPort = () => {
                const socket = new net.Socket();
                socket.once('connect', () => {
                    socket.end();
                    resolve();
                });
                socket.once('error', () => {
                    socket.destroy();
                    if (Date.now() > endTime) {
                        reject(new Error(`Timed out waiting for mitmproxy to start on port ${port}`));
                    } else {
                        setTimeout(checkPort, interval);
                    }
                });
                socket.connect(port, 'localhost');
            };

            checkPort();
        });
    }

    startWebSocketServer() {
        return new Promise((resolve) => {
            this.websocketServer = new WebSocketServer({port: 8765});
            console.log("WebSocket server started on ws://localhost:8765");

            this.websocketServer.on('connection', (ws, req) => {
                console.log(`New connection from ${req.socket.remoteAddress}`);

                ws.on('message', (message) => {
                    console.log(`Received message from ${req.socket.remoteAddress}: ${message}`);
                });

                ws.on('close', (code, reason) => {
                    console.log(`Connection closed from ${req.socket.remoteAddress} with reason: ${reason}`);
                });
            });

            resolve();
        });
    }

    async start() {
        await this.startMitmproxy();
        await this.startWebSocketServer();
        console.log("Mitmproxy is running and WebSocket server is ready.");
    }

    stop() {
        if (this.mitmproxyProcess) this.stopMitmproxy();
        if (this.websocketServer) {
            this.websocketServer.close(() => {
                console.log("WebSocket server closed");
                process.exit(0);
            });
        }
    }
}

module.exports = {MitmproxyManager}


