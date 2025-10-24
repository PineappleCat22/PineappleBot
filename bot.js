/* 
THIS FUCKING SUCKS!!!!!!!!!!!!!!!!!!!!
TODO: move all keys to a file somewhere and regenerate them
TODO: figure out how configs work in JS
TODO: move all code to pi server and test functionality
TODO: test token refresh code
*/


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import WebSocket from 'ws'; 

const BOT_USER_ID = '1061332176'; 
var USER_OAUTH_TOKEN = 'o6zux9zyg9fy84yrzp1klovu9bhhh3'; 
var USER_REFRESH_TOKEN = 'wv1qgtjo3hrwg5nprf0vtc9kk7samp7l5tivjdaaalf1f86dy1'
const CLIENT_ID = 'wzdd61mv3a654exqth0w346zhezuw1';
const CHAT_CHANNEL_USER_ID = '166740738'; 

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';


let server = true

var websocketSessionID;

// Start executing the bot from here
(async () => {
	// Verify that the authentication is valid
	await getAuth();

	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();

	//help where do i put code
	if (server) {
		const webserver = require('./server.js');
	}
})();

// WebSocket will persist the application loop until you exit the program forcefully

async function getAuth() {
	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: {
			'Authorization': 'OAuth ' + USER_OAUTH_TOKEN
		}
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
		console.error(data);
		if (response.status == 401) {
			console.log("Refreshing token...");
			let response = await fetch('https://id.twitch.tv/oauth2/token', {
				method: 'POST',
				headers: {
					'client-id': CLIENT_ID,
					'client-secret': '6ilpn48o72raf94zbhawli85ocoiik',
					'grant_type': 'refresh_token',
					'refresh_token': USER_REFRESH_TOKEN
				}
			});
			data = JSON.parse(response);
			USER_OAUTH_TOKEN = data.access_token;
			USER_REFRESH_TOKEN = data.refrese_token;
			//data = JSON.parse(jsonString);
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

function handleWebSocketMessage(data) {
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
						case '!pet':
							fetch('http://localhost:5000/petstatus', { method: 'POST' });
					}
					break;
			}
			break;
	}
}

async function sendChatMessage(chatMessage) {
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + USER_OAUTH_TOKEN,
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
			'Authorization': 'Bearer ' + USER_OAUTH_TOKEN,
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

