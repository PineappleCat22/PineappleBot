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

//THIS FUCKING SUCKS
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { method, url } = req;

    if (req.url == '/events') { //yo FUCK websockets and FUCK having correct headers
        sse.init(req, res);
        return;
        /*
        I CANT FINISH THIS SHIT I HAVE AN ESSAY AND TWO LABS DUE!!!
        to do list:
        msgs get sent but i need to parse them from string into json to handle them further.
        turn POST requests into SSE messages and send them.
        maybe await data before sending? i think its going out of order.
        SSE has a limit of 6 connections per browser without HTTP/2 which im not doing. so dont open 6 media players at once.
        */
    }
    else if (req.url == '/mediaplayer') {
        if (method == 'POST') {
            let body = '';
            req.on('data', function (data) {
                body += data;
            });

            req.on('end', function () {
                if (_verbose) {
                    console.log("SERVER: POST data for mediaplayer recieved.");
                    console.log(body);
                }
                let vals = body.split("&")
                if (vals.length != 2) {
                    console.log("SERVER: Mediaplayer recieved improper data.")
                    console.log(vals);
                }
                let media = vals[0].split("=");
                let caption = vals[1].split("=");
                sse.send({"content": "media", "media": media[1], "caption": caption[1]});
                res.end();
            });
        }
    }
    else if (req.url == '/petstatus') { // IS THIS HOW WE MAKE AN API??????????
        if (method == 'POST') {
            console.log('SERVER: Pet event sent');
            petStatus = 1;
            sleep(5000).then(() => {
                petStatus = 0;
            });
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