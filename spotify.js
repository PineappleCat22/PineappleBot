import http from 'http';

//yo idk if this needs to be async but whatever
async function getSong(USERNAME) {
    let response = await fetch("https://lastfm-last-played.biancarosa.com.br/" + USERNAME + "/latest-song")
    let data = await response.json();
    if (response.status != 200) {
        console.log(data)
        return "Something went wrong querying LastFM. Please call my dad."
    }
    if (data.track['@attr']?.nowplaying !== undefined) {
        return(data.track.name + " by " + data.track.artist['#text']);
    }
    else {
        return ("There is no song playing!");
    }
}

export { getSong };