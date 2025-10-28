import fs from 'fs';
import csv from 'fast-csv';
import { finished } from 'stream/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var CONFIG = require('./config.json');
const _verbose = CONFIG.Verbose;

//all my imports are inconsistent because i dont know what im doing

let PointDict = new Map();

//make all the variables before they are used (this is memory safe?)
let POINTS;
let USERNAME;

function getPoints(USERNAME) {
    if (PointDict.get(USERNAME) == undefined) {
        if (_verbose) {
            console.log("POINTS: Fetching points value for " + USERNAME);
        }
        return "User does not exist!";
    }
    else {
        POINTS = PointDict.get(USERNAME);
        return `${USERNAME} has ${POINTS} CrustCoin!`;
    }
}

function addPoints(USERNAME, POINTS) {
    let oldVal = PointDict.get(USERNAME);
    if (oldVal == undefined) {
        oldVal = 0;
    }
    PointDict.set(USERNAME, (oldVal + POINTS));
    if (_verbose) {
        console.log("POINTS: added points " + POINTS + " to " + USERNAME);
        console.log("POINTS: New value: " + (+oldVal + +POINTS));
    }
    return `Added ${POINTS} CrustCoin to ${USERNAME}!`;
}

function delPoints(USERNAME, POINTS) {
    if (PointDict.get(USERNAME) == undefined) {
        return "User does not exist!";
    }
    else {
        let oldVal = PointDict.get(USERNAME);
        PointDict.set(USERNAME, (oldVal - POINTS));
        if (_verbose) {
            console.log("POINTS: Removed points " + POINTS + " from " + USERNAME);
            console.log("POINTS: New value: " + (+oldVal - +POINTS));
        }
        return `Removed ${POINTS} CrustCoin from ${USERNAME}!`;
    }
}

async function readPoints() {
    console.log("POINTS: Backing up points.csv..."); //saving is destructive so backup every read!!!!
    try {
        await fs.promises.copyFile('points.csv', 'points.bak');
    }
    catch (err) {
        console.error("POINTS: Error while backing up points.csv!");
        console.error(err);
    }

    console.log("POINTS: Fetching data from points.csv...")
    const data = fs.createReadStream('points.csv')
        .pipe(csv.parse())
        .on('error', error => {
            console.error("POINTS: Fetching points from points.csv threw error.")
            console.error(error)
        })
        .on('data', row => {
            if (_verbose) {
                console.log(`POINTS: ROW=${row[0].toString()}, ${row[1]}`)
                PointDict.set(row[0], row[1]) // <== put data into dictionary, row object can be accessed like an array (start at 0)
            }}) 
        .on('end', rowCount => {
            if (_verbose) {
                console.log(`POINTS: Parsed ${rowCount} rows`)
                console.log(PointDict)
            }
        });

    await finished(data);
    console.log("POINTS: Data fetch success.")
}

function savePoints() {
    console.log("POINTS: Saving points...")
    fs.writeFile('points.csv', "", (err) => {
            console.error("POINTS: Error while saving points!");
            console.error(err);
    })
    PointDict.forEach(function (key, value) { //fucking foreach assigns the vars backward. fuck you!
        if (_verbose) {
            console.log("POINTS: writing: " + value + "," + key);
        }
        fs.appendFileSync('points.csv', value + "," + key + "\n");
        //fails to write first value occasionally. considering it might be due to overlapping writes, so dont spam this method.
    })
    return "Saved points successfully!";
}

/*
approach one: read all point values from a file into a dictionary
pros: changing values is easy (probably)
cons: potentially costly read at the beginning, crash = all changes lost

how this works:
there is a file (points.csv) with all of the points values and usernames.
on initialization, it reads the file and stores the entire thing in a dictionary, usernames are keys and point values are, well, the values.
this way, editing the values is easy.
it then saves the dictionary back to csv. how? i have no idea!
lets get started.
*/

//await readPoints(); //readPoints has to be called with the await so that the code doesnt continue without finishing fetching the data

export { getPoints, addPoints, delPoints, savePoints, readPoints }
