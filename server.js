//shrug
import http from 'http';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
var CONFIG = require('./config.json');
var SSE = require('express-sse');
var sse = new SSE({"content": "CONN_TEST"});

const _verbose = CONFIG.Verbose;
let petStatus = 0;
let data;

//what the fuck do you mean i have to add my own sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// it still shocks me that this is how you make an api. idk i guess i thought there would be a more refined way.
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { method, url } = req;

    if (req.url == '/events') { //yo FUCK websockets and FUCK having correct headers
        sse.init(req, res);
        return;
    }
    else if (req.url == '/mediaplayer') {
        if (method == 'POST') {
            let body = '';
            req.on('data', function (chunk) {
                body += chunk;
            });

            req.on('end', function () {
                if (_verbose) {
                    console.log("SERVER: POST data for mediaplayer recieved.");
                    console.log(body);
                }
                let data = JSON.parse(body);
                if (data.url == undefined) {
                    console.log("SERVER: Received data is missing URL!")
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('400: Bad Request!');
                }
                sse.send({"content": "media", "media": data.url, "caption": data.caption});
                res.end();
            });
        }
    }
    else if (req.url == '/') {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end("hello world!");
    }
    else if (req.url == '/petstatus') { // rework this logic into SSE.
        if (method == 'POST') {
            sse.send({ "content": "pet" });
            if (_verbose) {
                console.log('SERVER: Pet event sent');
            }
            //convert to SSE steps:
            //send an sse event to /events here
            //add a listener on pet.html to /events
            //that should be it?
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(petStatus.toString());
    }
    else {
        const stream = fs.createReadStream('./html' + req.url);

        stream.on('open', () => {
            res.writeHead(200, { 'content-type': 'text/html' });
            stream.pipe(res);
        })

        stream.on('error', err => {
            if (err.toString().includes("ENOENT")) {
                console.error('File read error:', err.message);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404: Not Found');
                return;
            }
            console.error('Something weird happened:', err.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500: INTERNAL SERVER ERROR');
        });
    }
    //code immediately exits if you try accessing a nonexistent file.
    //soooooo dont?
})
console.log("SERVER: Listening on port 5000")
server.listen(5000);
//dawg i have no idea if this will work on the server