//shrug
import http from 'http';
import fs from 'fs';

let petStatus = 0;

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

    
    if (req.url == '/petstatus') { // IS THIS HOW WE MAKE AN API??????????
        if (method == 'POST') {
            console.log('pet event sent');
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
console.log("listening on port 5000")
server.listen(5000);
//dawg i have no idea if this will work on the server