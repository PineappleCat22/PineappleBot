# PineappleBot

PineappleBot is a bot I made because I am really cool and also awesome

Features:
- you can pet jhona
- !song command that queries LastFM
- a webserver for hosting HTML files, if thats what you need
- coming soon: more documentation???? and spotify thing


###### todo: add more features

### RUNNING THE THING
Requirements: nodejs

Step 1: Download the thing (git clone https://github.com/PineappleCat22/PineappleBot.git)

Step 2: Configure the thing (add values to blank_config.json and rename it to config.json)
- BOT_ID: user ID of your bot user
- CHAT_ID: user ID of the chat
- CLIENT_ID and CLIENT_SECRET: obtained by making a twitch app on their developers page (dev.twitch.tv)
- OAUTH_TOKEN and REFRESH_TOKEN: obtained by authenticating your twitch bot (https://dev.twitch.tv/docs/chat/authenticating/) (required scopes: user:read:chat user:write:chat user:bot)

Step 3: Run the thing

`npm bot.js`