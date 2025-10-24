/* 
TODO: move all code to pi server and test functionality
TODO: figure out how to update config files with new keys
*/


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import WebSocket from 'ws'; 

var CONFIG = require('./config.json');

const BOT_USER_ID = CONFIG.BOT_ID; 
var OAUTH_TOKEN = CONFIG.OAUTH_TOKEN; 
var REFRESH_TOKEN = CONFIG.REFRESH_TOKEN;
const CLIENT_ID = CONFIG.CLIENT_ID;
const CHAT_CHANNEL_USER_ID = CONFIG.CHAT_ID; 
const CLIENT_SECRET = CONFIG.CLIENT_SECRET;
var websocketSessionID;
const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

const _server = CONFIG.ServerModule;
const _spotify = CONFIG.MusicModule;

var webserver;
var SongFetch;
const LASTFM_USER = CONFIG.LASTFM_USER;

// Start executing the bot from here
(async () => {
	// Verify that the authentication is valid
	await getAuth();

	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();

	//note to self: make a module init function instead of this
	if (_server) {
		console.log("server module enabled. starting up...")
		webserver = require('./server.js');
	}
	if (_spotify) {
		console.log("music module enabled. starting up...")
		SongFetch = require('./spotify.js');
	}
})();

// WebSocket will persist the application loop until you exit the program forcefully

async function getAuth() {
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: {
			'Authorization': 'OAuth ' + OAUTH_TOKEN
		}
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
		console.error(data);
		if (response.status == 401) {
			console.log("Refreshing token...");
			let body_data = {
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				grant_type: 'refresh_token',
				refresh_token: REFRESH_TOKEN
			};
			let formBody = new URLSearchParams(body_data).toString();
			let refresh_response = await fetch('https://id.twitch.tv/oauth2/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formBody
			});
			let refresh_data = await refresh_response.json();
			if (refresh_response.status != 200) {
				console.error("something really bad is happening. /oauth2/token returned " + refresh_response.status);
				console.error(refresh_data);
				process.exit(1);
			}
			OAUTH_TOKEN = refresh_data.access_token;
			CONFIG.OAUTH_TOKEN == refresh_data.access_token; //theres no way its this easy right
			REFRESH_TOKEN = refresh_data.refresh_token;
			CONFIG.REFRESH_TOKEN == refresh_data.refresh_token;
			response = await fetch('https://id.twitch.tv/oauth2/validate', { //get auth again
				method: 'GET',
				headers: {
					'Authorization': 'OAuth ' + OAUTH_TOKEN
				}
			});
			if (response.status != 200) {
				let data = await response.json();
				console.error("Token is not valid after refresh. /oauth2/validate returned status code " + response.status);
				console.error(data);
				console.error("god fucking damn it.");
				process.exit(1);
			}
		}
	}

	console.log("Validated token.");
}

function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

	websocketClient.on('error', console.error);

	websocketClient.on('open', () => {
		console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL);
	});

	websocketClient.on('message', (data) => {
		handleWebSocketMessage(JSON.parse(data.toString()));
	});

	return websocketClient;
}

async function handleWebSocketMessage(data) {
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {
				case 'channel.chat.message':
					// First, print the message to the program's console.
					console.log(`MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`);

					//shitty command programming below
					switch (data.payload.event.message.text.trim()) {
						case '!what':
							sendChatMessage("i am a bot developed by pineapple cat, the best programmer and most handsomest one as well")
							break;
						case '!pet':
							fetch('http://localhost:5000/petstatus', { method: 'POST' });
							break;
						case '!song':
							if (_spotify) {
								let song = await SongFetch.getSong(LASTFM_USER);
								sendChatMessage("@" + data.payload.event.chatter_user_login + ", " + song)
							}
							break;
					}
			}
			break;
	}
}

async function sendChatMessage(chatMessage) {
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: BOT_USER_ID,
			message: chatMessage
		})
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Failed to send chat message");
		console.error(data);
	} else {
		console.log("Sent chat message: " + chatMessage);
	}
}

async function registerEventSubListeners() {
	// Register channel.chat.message
	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'channel.chat.message',
			version: '1',
			condition: {
				broadcaster_user_id: CHAT_CHANNEL_USER_ID,
				user_id: BOT_USER_ID
			},
			transport: {
				method: 'websocket',
				session_id: websocketSessionID
			}
		})
	});

	if (response.status != 202) {
		let data = await response.json();
		console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
		console.error(data);
		process.exit(1);
	} else {
		const data = await response.json();
		console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
	}
}

