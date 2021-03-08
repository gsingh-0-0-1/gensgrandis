/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
/*/


const express = require('express')
var fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const {URLSearchParams} = require('url')


const http = require('http');
const app = express();

const server = http.createServer(app);

const io = require('socket.io')(server);

const port = 80
const host = process.argv[2]
console.log(host)

var log_file = fs.createWriteStream(__dirname + '/log.txt', {flags : 'a'});

server.listen(port, host);

const accesscodes = []
var rooms = []
var approvedrooms = 10

var gamerooms = []

var current_clients = new Object();

var gameroom_clients = new Object();

var chatroom_maxes = new Object();

var ready_for_reset = new Object();

var chatroom_in_game = new Object();

var basegameroomprops = ["map", "current_turn"]
basegameroomprops.sort()

var latest_id = 10000

var files = fs.readdirSync("saves");
var files = files.filter(file => file.includes("map"));
var num_maps = files.length


const MAX_PLAYERS = 2


function dealWithMalformed(res){
	//rickroll those hackers
	res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
}

function dealWithNoAuth(res){3
	res.redirect("/notauthorized")
}

function checkFileExists(dir, file){
	var files = fs.readdirSync(dir);
	if (files.includes(file)){
		return true
	}
	return false
}

function getSocket(id, path){
	var thissocket = io.of(path).sockets.get(id);

	return thissocket
}

function updateUsers(socket, l){
	socket.emit('userlist', l)
	socket.broadcast.emit('userlist', l)
}

function sendUserCountsUpdate(room){
	if (chatroom_in_game[room] == true){
		var s = "I-G"
	}
	else{
		var s = Object.keys(current_clients[room]).length
	}
	io.of("/").emit('roomupdate', room, s)
}

function createRoom(room){
	var cur_namespace = "/room/" + room
	io.of(cur_namespace).on("connection", (socket) => {

		socket.on('join', (username) => {
			var gameid = latest_id
			//var cookie = "id=" + (cookieid) + ";path=/"

			socket.internalCustomID = gameid

			latest_id += 1

			io.of(cur_namespace).emit('join', username)

			socket.emit('gameid', gameid)

			if (current_clients[room] == undefined){
				chatroom_maxes[room] = MAX_PLAYERS
				current_clients[room] = new Object();
			}

			current_clients[room][socket.internalCustomID] = username
			var l = Object.values(current_clients[room])
			updateUsers(socket, l)

			if (l.length >= chatroom_maxes[room]){
				io.of(cur_namespace).emit('startgame')
			}

			sendUserCountsUpdate(room)
		});

		socket.on('chat message', (msg, username) => {
			io.of(cur_namespace).emit('chat message', msg, username)
		});

		socket.on('starting_game', (authid, username) => {
			var l = Object.values(current_clients[room])
			if (l.length >= chatroom_maxes[room]){
				chatroom_in_game[room] = true
				authid = String(authid)
				username = String(username)
				if (Object.keys(current_clients[room]).includes(authid)){
					if (!gamerooms.includes(room) && room <= approvedrooms && room > 0){
						createGameRoom(room)
						gameroom_clients[room] = new Object()
						gamerooms.push(room)
						gameroom_clients[room].map = Math.ceil(num_maps * Math.random())
					}
					if (gamerooms.includes(room) && ready_for_reset[room] == true){
						gameroom_clients[room] = new Object()
						gameroom_clients[room].map = Math.ceil(num_maps * Math.random())
						ready_for_reset[room] = false
					}

					gameroom_clients[room][authid] = new Object()
					gameroom_clients[room][authid].user = username
					gameroom_clients[room][authid].playernum = Object.keys(gameroom_clients[room]).length - basegameroomprops.length
				}
			}
		})

		socket.on('disconnect', () => {
			socket.broadcast.emit('leave', current_clients[room][socket.internalCustomID])
			delete current_clients[room][socket.internalCustomID]
			if (Object.keys(current_clients[room]).length == 0){
				deleteGameRoom(room)
			}
			var l = Object.values(current_clients[room])
			updateUsers(socket, l)
			sendUserCountsUpdate(room)
		})
	});
}

function createGameRoom(room){
	var cur_namespace = "/gameroom/" + room

	io.of(cur_namespace).on('connection', (socket) => {

		socket.emit('whoareyou')

		socket.on('join', (username) => {

		})

		socket.on('i_am', (authid) => {
			socket.internalCustomID = authid//gameroom_clients[room][authid]
			var playernum = gameroom_clients[room][authid].playernum
			socket.internalPlayerID = playernum

			gameroom_clients[room][authid].socketid = socket.id

			if (playernum == 0){
				gameroom_clients[room].current_turn = playernum
				socket.emit('yourturn', playernum)
			}
		})

		socket.on('turndone', () => {
			if (gameroom_clients[room].current_turn == gameroom_clients[room][socket.internalCustomID].playernum){
				gameroom_clients[room].current_turn += 1
				gameroom_clients[room].current_turn = gameroom_clients[room].current_turn % chatroom_maxes[room]

				var nextplayer_authid = Object.keys(gameroom_clients[room])[gameroom_clients[room].current_turn]

				if (io.of(cur_namespace).sockets.get(gameroom_clients[room][nextplayer_authid].socketid) == undefined){
					io.of(cur_namespace).emit('endgame')
					deleteGameRoom(room)
					//delete gameroom_clients[room][nextplayer_authid]
				}
				else{
					io.of(cur_namespace).sockets.get(gameroom_clients[room][nextplayer_authid].socketid).emit('yourturn', gameroom_clients[room].current_turn)
				}
			}
		})

		socket.on('disconnect', () => {
			socket.broadcast.emit('endgame')
			deleteGameRoom(room)
		})


		//actual game mechanics below
		socket.on('unitcreated', (unit) => {
			socket.broadcast.emit('unitcreated', unit)
		})

		socket.on('moveunit', (id, x, y, z) => {
			socket.broadcast.emit('moveunit', id, x, y, z)
		})

		socket.on('buildcity', (id, name) => {
			socket.broadcast.emit('buildcity', id, name)
		})

		socket.on('expandcity', (dir0, dir1, x, y, id) => {
			socket.broadcast.emit('expandcity', dir0, dir1, x, y, id)
		})

		socket.on('redirectfood', (x1, y1, x2, y2, amt) => {
			socket.broadcast.emit('redirectfood', x1, y1, x2, y2, amt)
		})

	})
}


function deleteGameRoom(room){
	//delete gameroom_clients[room][socket.internalCustomID]
	var sortedkeys = Object.keys(gameroom_clients[room])
	sortedkeys.sort()
	//if (sortedkeys.includes(...basegameroomprops) && sortedkeys.length == basegameroomprops.length){
	for (var user of Object.keys(current_clients[room])){
		delete current_clients[room][user]
		sendUserCountsUpdate(room)
	}
	ready_for_reset[room] = true
	chatroom_in_game = false
	sendUserCountsUpdate(room)
	//}
}

app.use(express.static('public'));



//the first catch-all, meant for logging and such
app.get("/*", (req, res, next) => {
	var ip = req.connection.remoteAddress;
	if (req.url.includes('gettile') || req.url.includes('maxplayers') || req.url.includes('numcurrentplayers')){
		return next();
	}
	var text = "Connection to " + req.url + " at " + new Date(new Date().toUTCString()) + " from " + ip
	console.log(text)
	log_file.write(text + '\n');
	return next();
})


//these routes below are exempt from any checks
app.get("/", (req, res) => {
	res.sendFile("public/templates/landing.html", {root: __dirname})
})

/*app.get("/funds", (req, res) => {
	res.sendFile("public/templates/funds.html", {root: __dirname})
})*/

app.get("/access", (req, res) => {
	res.sendFile("public/templates/access.html", {root: __dirname})
})

app.get("/approvedrooms", (req, res) => {
	res.send(String(approvedrooms));
})


//check for access code here, before the rest of the url's
//currently disabling the need for an access code
app.get("/*", (req, res, next) => {
	var baseurl = req.url
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var codeparam = urlParams.get("accesscode")
	if (accesscodes.includes(codeparam)){
		return next();
	}
	else if (baseurl.includes("templates")){
		return next();
	}
	else{
		return next()
		//dealWithMalformed(res)
	}
})

app.get('/room/:id', function(req, res){
	var room = req.params.id

	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	room = room * 1


	//set up socket function for the room if it doesn't already exist
	if (!rooms.includes(room) && room <= approvedrooms && room > 0){
		createRoom(room)
		//current_clients[room] = new Object()
		rooms.push(room)
		res.sendFile("public/templates/chatroom.html", {root: __dirname})
	}
	else if (rooms.includes(room) && chatroom_in_game[room] != true){
		if (Object.keys(current_clients[room]).length >= chatroom_maxes[room]){
			res.redirect("/roomisfull")
		}
		res.sendFile("public/templates/chatroom.html", {root: __dirname})
	}
	else{
		dealWithNoAuth(res)
		return
	}
});

app.get("/roomisfull", (req, res) => {
	res.sendFile("public/templates/roomisfull.html", {root: __dirname})
})

app.get("/notauthorized", (req, res) => {
	res.sendFile("public/templates/notauthorized.html", {root: __dirname})
})



app.get("/gamefile/:id", (req, res) => {
	var room = req.params.id
	res.send("map" + gameroom_clients[room].map)
})

app.get("/numsaves", (req, res) => {
	res.send(String(num_maps))
})

app.get("/maxplayers/:room", (req, res) => {
	var room = req.params.room
	res.send(String(MAX_PLAYERS))
})

app.get("/numcurrentplayers/:room", (req, res) => {
	var room = req.params.room
	if (chatroom_in_game[room] == true){
		res.send("I-G")
	}
	else if (current_clients[room] == undefined){
		res.send("0")
	}
	else{
		res.send(String(Object.keys(current_clients[room]).length))
	}
})

app.get("/gameroom/:id", (req, res) => {
	var room = req.params.id
	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	room = room * 1


	var baseurl = req.url
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var gameuserid = urlParams.get("gameid")

	if (isNaN(gameuserid)){
		dealWithMalformed(res)
		return
	}


	if (gameroom_clients[room] == undefined){
		dealWithNoAuth(res)
		return
	}

	if (!Object.keys(gameroom_clients[room]).includes(gameuserid)){
		dealWithNoAuth(res)
		return
	}

	//delete current_clients[room][gameuserid]

	res.sendFile("public/templates/main.html", {root: __dirname})
})

app.get("/game", (req, res) => {
	res.sendFile("public/templates/main.html", {root: __dirname})
})

app.get("/spawnlocs/:room", (req, res) => {
	var room = req.params.room

	var file = gameroom_clients[room].map

	if (file == undefined){
		dealWithMalformed(res)
		return
	}

	res.sendFile("saves/map" + file + "/spawnlocs.txt", {root: __dirname})	

})

app.get("/spawnlocsbyfile/:file", (req, res) => {
	var file = req.params.file

	if (!checkFileExists("saves/", file)){
		dealWithMalformed(res)
		return
	}

	res.sendFile("saves/" + file + "/spawnlocs.txt", {root: __dirname})
})

app.get("/gettile", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var x = urlParams.get("x")
	var y = urlParams.get("y")

	var malformed = false

	if (isNaN(x)){
		malformed = true
	}

	var file = urlParams.get("file")

	if (!checkFileExists('saves/', file)){
		malformed = true
	}

	//rickroll the hackers
	if (malformed){
		dealWithMalformed(res)
		return
	}

	var db = new sqlite3.Database("saves/" + file + "/world.db")
	var command = "SELECT * FROM world WHERE tilename='" + x + "_" + y + "'"

	db.all(command, [], (err, rows) => {
		if (err) {
			throw err;
		}
		res.send(rows)
	})
})

app.get("/seed", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var file = urlParams.get("file")
	if (!checkFileExists('saves/', file)){
		dealWithMalformed(res)
		return
	}
	res.sendFile("saves/" + file + "/seed.txt", {root: __dirname})	
})

app.get("/explored", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var file = urlParams.get("file")
	if (!checkFileExists('saves/', file)){
		dealWithMalformed(res)
		return
	}
	res.sendFile("saves/" + file + "/explored.txt", {root: __dirname})	
})

app.get("/units", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var file = urlParams.get("file")
	if (!checkFileExists('saves/', file)){
		dealWithMalformed(res)
		return
	}
	res.sendFile("saves/" + file + "/units.txt", {root: __dirname})	
})

app.get("/peopletemplate", (req, res) => {
	res.send("P~x:xhere,y:yhere,n:nhere,m:mhere")
})

app.get("/getsaves", (req, res) => {
	var files = fs.readdirSync("saves");
	var files = files.filter(file => file.includes("map"));
	res.send(files)
})

//app.listen(port, host)