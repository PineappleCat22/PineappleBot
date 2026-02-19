//uhhhh.
//1 in 10 dice roll
//pick a random fish from an array
//maybe another 1 in 100 for a modifier?
//make it a dict so i can assign fishname => value.
//and another one that stores usernames and lastfish datetime (unix timestamp?)
//it should only let you fish after x time from lastfish.
//*smokes blunt* what if... the fish values CHANGED. EVERY DAY.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var CONFIG = require('../config.json');
const _verbose = CONFIG.Verbose;
import fs from 'fs';
import csv from 'fast-csv';
import { finished } from 'stream/promises';

const fishValues = new Map()
const lastFish = new Map()
const fishArray = new Array()
const fishMultipliers = new Map() // ALL THE MAPS.
var fishWeight
var fishAdditive = 5
var fishValue

//TODO: VERBOSE LOGGING

async function loadFish(fishList) {
	for (var i in fishList) {
		fishValues.set(fishList[i], Math.random() * 10 + 1)
		fishArray[i] = fishList[i]
	}
}

async function loadModifiers() {

}

//REMEMBER THIS IS ASYNC. WE NEED TO AWAIT IT OR THE RESPONSE IS A PROMISE{}
async function catchFish(username) {
	if (Math.floor(Math.random() * 5) == 4) {
		var i = Math.floor(Math.random() * fishArray.length)
		fishWeight = Math.floor(Math.random() * 1000) / 100 
		fishValue = Math.floor(fishValues.get(fishArray[i]) * fishWeight + fishAdditive)

		return(username + " caught a " + fishArray[i] + " weighing " + fishWeight + " lbs, worth " + fishValue)
	}
	else {
		return(username + " didn't catch any fish. (cooldown 10 minutes)")
	}
}

export { loadFish, catchFish}