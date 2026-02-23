//this file is probably the worst piece of written code ever. im so so sorry.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var CONFIG = require('../config.json');
const _verbose = CONFIG.Verbose;
const _points = CONFIG.PointsModule;
var Points = require('./points.js');
import fs from 'fs';
import csv from 'fast-csv';
import { finished } from 'stream/promises';
import { indefiniteArticle } from './indefinite-article.js';

const fishValues = new Map()
const nextFish = new Map()
const fishArray = new Array()
const fishMultipliers = new Map() // ALL THE MAPS.
const multArray = new Array()
var fishWeight
var fishAdditive = 5
var fishValue

//TODO: VERBOSE LOGGING

async function loadFish(fishList) {
	for (var i in fishList) {
		fishValues.set(fishList[i], Math.random() * 10 + 50)
		fishArray[i] = fishList[i]
	}
}

async function loadModifiers() {
    if (_verbose) {
        console.log("FISH: Fetching modifier data from fishmods.csv...")
    }
    const data = fs.createReadStream('./data/fishmods.csv')
        .pipe(csv.parse())
        .on('error', error => {
            console.error("FISH: Fetching fishmods from fishmods.csv threw error.")
            console.error(error)
        })
        .on('data', row => {
            if (_verbose) {
                console.log(`FISH: ROW=${row[0].toString()}, ${row[1]}`)
                fishMultipliers.set(row[0].toString(), row[1]) // <== put data into dictionary, row object can be accessed like an array (start at 0)
                multArray.push(row[0])
            }}) 
        .on('end', rowCount => {
            if (_verbose) {
                console.log(`FISH: Parsed ${rowCount} rows`)
                console.log(fishMultipliers)
            }
        })};

//REMEMBER THIS IS ASYNC. WE NEED TO AWAIT IT OR THE RESPONSE IS A PROMISE{}
async function catchFish(username) {
    if (Date.now() < nextFish.get(username)) {
        let date = new Date(nextFish.get(username))
        return("@" + username + " chill. You can fish again in " + Math.floor(((date.getTime() - Date.now()) / 1000) / 60) + " minutes, " + Math.floor(((date.getTime() - Date.now()) / 1000) % 60) + " seconds.")
    }
    else {
        if (randNumber(2) == 1) {
            var multString = ""
		    var fishIndex = randNumber(fishArray.length)
            var multIndex

		    fishWeight = randNumber(1000) / 100 //calculate the weight
		    fishValue = Math.floor(
                fishValues.get(fishArray[fishIndex]) 
                * fishWeight 
                + fishAdditive)

            if (randNumber(10) == 5) {
                multIndex = randNumber(multArray.length)
                fishValue = fishValue * fishMultipliers.get(multArray[multIndex])
                multString += multArray[multIndex] + " "
                console.log(fishValue)

                if (randNumber(10) == 5) {
                    multIndex = randNumber(multArray.length)
                    fishValue = fishValue * fishMultipliers.get(multArray[multIndex])
                    multString += multArray[multIndex] + " "
                    console.log(fishValue)

                    if (randNumber(10) == 5) {
                        multIndex = randNumber(multArray.length)
                        fishValue = fishValue * fishMultipliers.get(multArray[multIndex])
                        multString += multArray[multIndex] + " "
                        console.log(fishValue)
                    } // if you have super luck, you can get three mults!
                }
            }
            nextFish.set(username, Date.now() + 600000)
            if (_points) {
                console.log(Points.addPoints(username, fishValue))
            }
            //im installing a package just to make sure i use the right article here. god.
            //a special thanks to Rodrigo Neri.
		    return(username + " caught " + indefiniteArticle(multString + fishArray[fishIndex]) + " " + multString + fishArray[fishIndex] + " weighing " + fishWeight + " lbs, worth " + Math.floor(fishValue) + " CrustCoin. (10 minute cooldown.)")
        }
        else {
            nextFish.set(username, Date.now() + 300000)
		    return(username + " didn't catch any fish. (5 minute cooldown.)")
	    }
    }
}

function randNumber(max) {
    return Math.floor(Math.random() * max)
}

export { loadFish, catchFish, loadModifiers}