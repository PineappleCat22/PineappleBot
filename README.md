# PineappleBot

PineappleBot is a bot I made because I am really cool and also awesome

this thing is provided as-is!!!!!! just the code, no bot user. you can do that bit on your own, i believe in you!!!!!!!!!!!!!

is it the best bot code-wise? god no, because i made it in nodejs. this thing is a rat's nest man! javascript was never meant to be used like this!

is it the best bot feature wise? be the judge of that yourself. I just made it because I saw a bunch of junk missing from other bots.

Features:
- you can pet jhona
- !song command that queries LastFM
- a webserver for hosting HTML files, if thats what you need
- spotify now playing thing
- points system

### roadmap
- [x] THE BOT DOESNT ACTUALLY CHECK IF THE MODULE IS ENABLED. AAAAAAAAAAAA
- [ ] steal more features from other bots
	- [ ] offline/online mode
	- [x] fish
		- [x] fishing
		- [x] get points from the fish
		- [x] fish modifiers
		- [x] verbose fish logging
		- [x] cooldown
		- [ ] rare fish events?
		- [x] load fish from config
	- [ ] malt's bot is kinda cool...
	- [ ] ranks? lifetime points?
- [ ] Mediashare
	- [x] Create an html container for video + caption
	- [x] handler to receive videos via post req
	- [x] send videos to client instance (eventsource)
	- [x] show video with caption for duration of video
	- [x] the actual code that sends the media link and caption
		- [x] more than one word in the caption
	- [x] sanitize media input!!!
	- [ ] media source blacklist
	- [ ] check and support for gifs/images
	- [ ] support for remote resources (imgur images, tenor gifs, youtube videos)
	- [ ] BONUS! sse listener on pet.html
	- [ ] BONUS BONUS! maybe do something for text overflow?
- [ ] Custom Commands
	- [ ] Make CSV parser for commands
	- [ ] parse CSV into dictionary
	- [ ] attach dict to main command parser
- [ ] points system
	- [ ] delete users from points dict
	- [ ] ban/blacklist users from receiving points
	- [ ] delete all ur points on chat ban fuck you
- [ ] blank music widget when music is not playing
- [ ] refetch oauth when expired
	- [ ] and save it
- [ ] scheduled functions (data backup every hour, refetch auth)
- [ ] activate/deactivate modules
- [ ] developer environment to test commands????
- [ ] documentation
