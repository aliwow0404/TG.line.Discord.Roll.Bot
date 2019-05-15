try {
	if (process.env.LINE_CHANNEL_ACCESSTOKEN) {
		//	var channelSecret = process.env.LINE_CHANNEL_SECRET;
		// Load `*.js` under modules directory as properties
		//  i.e., `User.js` will become `exports['User']` or `exports.User`
		require('fs').readdirSync('./modules/').forEach(function (file) {
			if (file.match(/\.js$/) !== null && file !== 'index.js' && file.match(/^core-/) == null) {
				var name = file.replace('.js', '');
				exports[name] = require('../modules/' + file);
			}
		});
		var Linecountroll = 0;
		var Linecounttext = 0;
		const line = require('linebot');
		//	const express = require('express');
		var app = line({
			channelId: process.env.LINE_CHANNEL_ID,
			channelAccessToken: process.env.LINE_CHANNEL_ACCESSTOKEN,
			channelSecret: process.env.LINE_CHANNEL_SECRET,
		});

		const channelKeyword = process.env.DISCORD_CHANNEL_KEYWORD || "";

		const BootTime = new Date(new Date().toLocaleString("en-US", {
			timeZone: "Asia/Shanghai"
		}));


		app.on('message', function (event) {
			switch (event.message.type) {
				case 'text':
					event.source.profile().then(function (profile) {
						handleEvent(event, profile);
					});
					break;
				default:
					break;
			}
		});

		function replymessage(message) {
			return {
				type: 'text',
				text: message
			}
		};
		//event.source.userId
		//event.source.groupId
		/*
		app.push('<to>', message)
			.then(() => {

			})
			.catch((err) => {
				// error handling
			});

		*/


		// create LINE SDK config from env variables


		// create LINE SDK client
		//	const client = new line.Client(config);

		// create Express app
		// about Express itself: https://expressjs.com/
		//	const app = express();

		// register a webhook handler with middleware
		// about the middleware, please refer to doc
		/*	app.post('/', line.middleware(config), (req, res) => {
				Promise
					.all(req.body.events.map(handleEvent))
					.then((result) => res.json(result))
					.catch((err) => {
						console.error(err);
						res.status(500).end();
					});
			});

			*/


		// event handler
		function handleEvent(event, profile) {
			if (event.type !== 'message' || event.message.type !== 'text') {
				// ignore non-text-message event
				return null;
			}

			/*
			profile: { userId: 'U1a17e51f0601949ef18c40df39f0293d',
			  displayName: 'XXXXX',
			  pictureUrl:
			    'https://profile.line-scdn.net/0hCNwCXXXXXX',
			  statusMessage: 'XXXXX' }
			*/
			let roomorgroupid, userid, userName = ''
			let userrole = 2;
			if (event.source.groupId) roomorgroupid = event.source.groupId
			if (event.source.roomId) roomorgroupid = event.source.roomId
			if (event.source.userId) userid = event.source.userId
			if (profile.displayName) userName = profile.displayName
			let rplyVal = {};
			let msgSplitor = (/\S+/ig)
			if (event.message.text)
				var mainMsg = event.message.text.match(msgSplitor); // 定義輸入字串
			if (mainMsg && mainMsg[0])
				var trigger = mainMsg[0].toString().toLowerCase(); // 指定啟動詞在第一個詞&把大階強制轉成細階

			// 訊息來到後, 會自動跳到analytics.js進行骰組分析
			// 如希望增加修改骰組,只要修改analytics.js的條件式 和ROLL內的骰組檔案即可,然後在HELP.JS 增加說明.

			let privatemsg = 0
			if (trigger.match(/^(\s|)dr/i) && mainMsg && mainMsg[1]) {
				privatemsg = 1

				//mainMsg.shift()
				//trigger = mainMsg[0].toString().toLowerCase()
				event.message.text = event.message.text.replace(/^[d][r][ ]/i, '')
			}
			if (channelKeyword != '' && trigger == channelKeyword.toString().toLowerCase()) {
				//mainMsg.shift()
				rplyVal = exports.analytics.parseInput(event.message.text, roomorgroupid, userid, userName, userrole, exports.analytics.stop)
			} else {
				if (channelKeyword == '') {
					rplyVal = exports.analytics.parseInput(event.message.text, roomorgroupid, userid, userName, userrole, exports.analytics.stop)

				}

			}

			if (rplyVal && rplyVal.text) {
				Linecountroll++;
				//console.log('rplyVal.text:' + rplyVal.text)
				//console.log('Line Roll: ' + Linecountroll + ', Line Text: ' + Linecounttext, " content: ", event.message.text);

				if (privatemsg == 1) {
					app.push(roomorgroupid, replymessage('暗骰進行中'))
						.then(() => { })
						.catch((err) => {
							// error handling
						});
					//message.reply.text(message.from.first_name + ' 暗骰進行中')
					async function loada() {
						for (var i = 0; i < rplyVal.text.toString().match(/[\s\S]{1,1200}/g).length; i++) {
							await app.push(userid, replymessage(rplyVal.text.toString().match(/[\s\S]{1,1200}/g)[i]))
								.then(() => {
									return null
								})
								.catch((err) => {
									// error handling
								});
						}
					}
					loada();
				} else {
					async function loadb() {
						for (var i = 0; i < rplyVal.text.toString().match(/[\s\S]{1,1200}/g).length; i++) {
							if (roomorgroupid)
								var replyTarget = roomorgroupid
							else replyTarget = userid
							await app.push(replyTarget, replymessage(rplyVal.text.toString().match(/[\s\S]{1,1200}/g)[i]))
								.then(() => {
									return null
								})
								.catch((err) => {
									// error handling
								});
						}
					}
					loadb();

				}



			} else {
				Linecounttext++;
				if (Linecounttext % 500 == 0)
					console.log('Line Roll: ' + Linecountroll + ', Line Text: ' + Linecounttext);
				return null
			}



			// create a echoing text message
			//exports.analytics.parseInput(event.message.text)

			// use reply API
			//Reply Max: 1200 characters
		}

		// listen on port
		const port = process.env.PORT || 5000;
		app.listen('/', port, () => {
			console.log(`Line BOT listening on ${port}`);
		});

		/*app.get('/', function (req, res) {
		//	res.send(parseInput(req.query.input));
		res.send('Hello');
	});
*/


	}
} catch (e) {
	console.log(e)
}