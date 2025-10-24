//shrug
import http from 'http';
import fs from 'fs';

//THIS FUCKING SUCKS
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url == '/mid') {
        console.log('piss!');
        res.end('GO FUCK YOURSELF');
    }
    else {
        fs.createReadStream('./html' + req.url).pipe(res)
    }
    //code immediately exits if you try accessing a nonexistent file.
    //soooooo dont?
})
console.log("listening on port 5000")
server.listen(5000);
//dawg i have no idea if this will work on the server