const USERNAME = "pineapple_cat";
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

const getTrack = async () => {
    const request = await fetch(BASE_URL);
    const json = await request.json();

    let isPlaying = json.track['@attr']?.nowplaying || false;

    if (isPlaying) {
        document.getElementById("listening").innerHTML = `
        <div style="  padding-right:1%;">
        <img src="${json.track.image[3]['#text']}" style=height:250px;" padding-top:10px;">
        </div>
        <div id="trackInfo" style=" padding-left:1%;">
        <h3 id="trackName" style="font-size: 35px;">${json.track.name}</h3>
        <p id="artistName"style="font-size: 30px;">${json.track.artist['#text']}</p>
        </div>
        `
    }
    else {
        document.getElementById("listening").innerHTML = `
        <div style="  padding-right:1%;">
        <img src="" style=height:250px;" padding-top:10px;">
        </div>
        <div id="trackInfo" style=" padding-left:1%;">
        <h3 id="trackName" style="font-size: 35px;"></h3>
        <p id="artistName"style="font-size: 30px;"></p>
        </div>
        `
    }
    // Values:
    // COVER IMAGE: json.track.image[1]['#text']
    // TITLE: json.track.name
    // ARTIST: json.track.artist['#text']

    
};

getTrack();
setInterval(() => { getTrack(); }, 5000);