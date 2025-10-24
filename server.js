//shrug
import http from 'http';
import fs from 'fs';

let status = 0;

//what the fuck do you mean i have to add my own sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//THIS FUCKING SUCKS
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(200, { 'content-type': 'text/html' });

    const { method, url } = req;

    
    if (req.url == '/petstatus') { // IS THIS HOW WE MAKE AN API??????????
        if (method == 'POST') {
            console.log('pet event sent');
            status = 1;
            sleep(5000).then(() => {
                status = 0;
            });
        }
        res.end(status.toString());
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