/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
/*/


const express = require('express')
var fs = require('fs');
const {URLSearchParams} = require('url')
const path = require("path")
const zlib = require("zlib");

const bodyParser = require('body-parser');

const https = require('https');
const http = require('http');
const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));

const io = require('socket.io')(server);

const port = 80
const host = process.argv[2]
console.log(host)

var log_file = fs.createWriteStream(__dirname + '/log.txt', {flags : 'a'});

var blacklist_file = fs.createWriteStream(__dirname + '/blacklist.txt', {flags : 'a'});

server.listen(process.env.PORT || port, host);


function keepAlive(){
	https.get("https://gensgrandis.onrender.com", (resp) => {
	
	})
}

setInterval(keepAlive, 5 * 60 * 1000);

const accesscodes = []
var rooms = []
var approvedrooms = 10

var gamerooms = []

var current_clients = new Object();

var gameroom_clients = new Object();

var chatroom_maxes = new Object();

var ready_for_reset = new Object();

var chatroom_in_game = new Object();

var disabled_rooms = new Object();

var basegameroomprops = ["map", "current_turn"]
basegameroomprops.sort()

var latest_id = 10000

var files = fs.readdirSync("saves");
var files = files.filter(file => file.includes("map"));
var num_maps = files.length

//first is 0 since rooms start at 1
const MAX_PLAYERS = [0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3]

var TRACKED_PAGES = ['/', '/about', '/dev', '/changelog', '/soundtrack', '/mapimgs', '/wiki', '/game', '/darkreunion', '/ping']

for (var i = 1; i <= approvedrooms; i++){
	TRACKED_PAGES.push("/room/" + i)
}

//--------------------------------------------------------------------
const COMMON_EXCHANGES = {
	".2#l" : "!",
	"0#r" : "@",
	"0#w" : "[",
	"0#sr" : "]",
	".2#d" : "$",
	".2#f|1" : "-",
	"#f|1" : "{",
}

var COMMON_EXCHANGES_INV = {}

for (key of Object.keys(COMMON_EXCHANGES)){
	COMMON_EXCHANGES_INV[COMMON_EXCHANGES[key]] = key
}

//--------------------------------------------------------------------

const COMMON_COMPRESSES = {
	"!!!!" : "*",
	"----" : "(",
	"@@@" : ")",
	"#l" : "_",
}

var COMMON_COMPRESSES_INV = {}

for (key of Object.keys(COMMON_COMPRESSES)){
	COMMON_COMPRESSES_INV[COMMON_COMPRESSES[key]] = key
}

//--------------------------------------------------------------------


function dealWithMalformed(res){
	//rickroll those hackers
	res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
}

function dealWithNoAuth(res){
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
	var s = Object.keys(current_clients[room].players).length
	io.of("/").emit('roomupdate', room, s)
}

function initRoom(room){
	var cur_namespace = "/room/" + room

	io.of(cur_namespace).on('connection', (socket) => {

		if (Object.keys(current_clients[room].players).length >= current_clients[room].properties.maxplayers){
			return
		}

		current_clients[room].players[socket.id] = socket
		sendUserCountsUpdate(room)

		if (Object.keys(current_clients[room].players).length >= current_clients[room].properties.maxplayers){
			current_clients[room].properties.game_started = true
			let targetplayer = Object.keys(current_clients[room].players)[0]
			current_clients[room].players[targetplayer].emit('yourturn', 0)
		}

		socket.on('i_am', (authid) => {
		})

		socket.on('turndone', () => {
			if (!current_clients[room].properties.game_started){
				return
			}

			//ensure that only the player whose turn it currently is can actually end the turn
			let currentplayers = Object.keys(current_clients[room].players)
			let currentplayer = currentplayers[current_clients[room].properties.current_turn]

			console.log(currentplayer, socket.id)

			if (currentplayer != socket.id){
				return
			}
			//if (current_clients[room].properties.current_turn)
			current_clients[room].properties.current_turn += 1
			current_clients[room].properties.current_turn = current_clients[room].properties.current_turn % current_clients[room].properties.maxplayers

			//get the target player
			let targetplayer = currentplayers[current_clients[room].properties.current_turn]

			current_clients[room].players[targetplayer].emit('yourturn', current_clients[room].properties.current_turn)
		})

		socket.on('disconnect', () => {
			if (current_clients[room].properties.game_started){
				socket.broadcast.emit('endgame')
				createRoom(room)
				sendUserCountsUpdate(room)
			}
			else{
				delete current_clients[room].players[socket.id]
				sendUserCountsUpdate(room)
			}
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

		socket.on('addbuilding', (subtile, texturename, x, y, id) => {
			socket.broadcast.emit('addbuilding', subtile, texturename, x, y, id)
		})

		socket.on('removebuilding', (subtile, x, y, id) => {
			socket.broadcast.emit('removebuilding', subtile, x, y, id)
		})

		socket.on('chatmessage', (username, msg) => {
			socket.broadcast.emit("chatmessage", username, msg)
		})
	})
}

function createRoom(room){

	disabled_rooms[room] = true

	setTimeout(function(){
		disabled_rooms[room] = false
	}, 1500)

	current_clients[room] = new Object()
	current_clients[room].properties = new Object()
	current_clients[room].players = new Object()

	rooms.push(room)

	current_clients[room].properties.maxplayers = MAX_PLAYERS[room]
	current_clients[room].properties.map = Math.ceil(Math.random() * num_maps)
	current_clients[room].properties.current_turn = 0

	current_clients[room].properties.game_started = false

}

function emitServerMessageToAll(msg){
	for (var room of rooms){
		io.of("/room/" + room).emit("server_message", msg)
	}
	io.of("/game").emit("server_message", msg)
}

function writeLog(url, time, ip, connection){
	var text = ip + " -- " + connection + " @ " + url + "\n\t" + time
	console.log(text)
	log_file.write(text + '\n');	
}

function checkBlackList(ip){
	var BLACKLIST = fs.readFileSync("blacklist.txt")
	BLACKLIST = BLACKLIST.toString()
	BLACKLIST = BLACKLIST.split("\n")
	if (BLACKLIST.includes(ip)){
		return true
	}
	return false
}

app.use(express.static('public'));



//the first catch-all, meant for logging and such
app.get("/*", (req, res, next) => {
	var ip = req.connection.remoteAddress;
	if (checkBlackList(ip)){
		writeLog(req.url, new Date(new Date().toUTCString()), ip, "CO_BLACKLIST")
		res.send("stop messing with my website")
		return
	}
	/*if (req.url.includes('gettile') || req.url.includes('maxplayers') || req.url.includes('numcurrentplayers') || req.url.includes('approvedrooms') || req.url.includes('gitlog')){
		let ref = req.headers.referer
		if (ref == undefined){
			//dealWithMalformed(res)
			//return
		}
		return next();
	}*/
	if (TRACKED_PAGES.includes(req.url)){
		writeLog(req.url, new Date(new Date().toUTCString()), ip, "CONNECTION")
	}
	return next();
})


//these routes below are exempt from any checks
app.get("/", (req, res) => {
	res.sendFile("public/templates/landing.html", {root: __dirname})
})

app.get("/about", (req, res) => {
	res.sendFile("public/templates/about.html", {root: __dirname})
})

app.get("/dev", (req, res) => {
	res.sendFile("public/templates/dev.html", {root: __dirname})
})

app.get("/wiki", (req, res) => {
	res.sendFile("public/templates/wiki.html", {root: __dirname})
})

/*
app.get("/changelog", (req, res) => {
	res.sendFile("public/templates/changelog.html", {root: __dirname})
})
*/

app.get("/soundtrack", (req, res) => {
	res.sendFile("public/templates/soundtrack.html", {root: __dirname})
})

app.get("/gitlog", (req, res) => {
	res.sendFile("gitlog.txt", {root: __dirname})
})

app.get("/mapimgs", (req, res) => {
	res.sendFile("public/templates/mapimgs.html", {root: __dirname})
})

app.get("/bugs", (req, res) => {
	res.sendFile("public/templates/bugs.html", {root: __dirname})
})

app.get("/videos", (req, res) => {
	res.sendFile("public/templates/videos.html", {root: __dirname})
})

app.get("/ping", (req, res) => {
	res.send("pong")
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

	dealWithNoAuth(res)
	return


	/*console.log(current_clients)

	console.log("--------------")

	console.log(gameroom_clients)

	console.log("--------------")*/

	var room = req.params.id

	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	if (disabled_rooms[room] == true){
		dealWithNoAuth(res)
		return
	}

	room = room * 1


	//set up socket function for the room if it doesn't already exist
	if (!rooms.includes(room) && room <= approvedrooms && room > 0){
		createRoom(room)
		//current_clients[room] = new Object()
		rooms.push(room)
		//res.sendFile("public/templates/chatroom.html", {root: __dirname})
		res.sendFile("public/templates/main.html", {root: __dirname})
		return
	}
	else if (rooms.includes(room)){

		if (current_clients[room] == undefined){

		}
		else if (Object.keys(current_clients[room].players).length >= current_clients[room].properties.maxplayers){
			res.redirect("/roomisfull")
			return
		}
		//res.sendFile("public/templates/chatroom.html", {root: __dirname})
		res.sendFile("public/templates/main.html", {root: __dirname})
		return
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
	var room = req.params.id * 1

	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	res.send("map" + current_clients[room].properties.map)
})

app.get("/numsaves", (req, res) => {
	var files = fs.readdirSync("saves");
	var files = files.filter(file => file.includes("map"));
	var num_maps = files.length
	res.send(String(num_maps))
})

app.get("/maxplayers/:room", (req, res) => {
	var room = req.params.room * 1

	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	res.send(String(current_clients[room].properties.maxplayers))
})

app.get("/numcurrentplayers/:room", (req, res) => {
	var room = req.params.room * 1

	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	res.send(String(Object.keys(current_clients[room].players).length))
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

	var file = current_clients[room].properties.map

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
	var chunk = urlParams.get("chunk")
	var raw = urlParams.get("raw")

	var malformed = false

	if (isNaN(x) || isNaN(y)){
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

	x = x * 1
	y = y * 1


	fs.readFile(path.resolve(__dirname, "saves/" + file + "/world_data/" + y + ".txt"), 'utf8' , (err, data) => {
		if (err) {
			console.error(err)
			return
		}

		if (raw != "t"){

			for (var key of Object.keys(COMMON_COMPRESSES_INV)){
				data = data.split(key)
				data = data.join(COMMON_COMPRESSES_INV[key])
			}

			for (var key of Object.keys(COMMON_EXCHANGES_INV)){
				data = data.split(key)
				data = data.join(key + "\n")
			}
			data = data.split("\n")
		}

		if (chunk == "t"){ //check if the user wants the full chunk
			res.send(data)
			return
		}
		res.send(data[x])
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

app.get("/darkreunion", (req, res) => {
	res.send("It's DUCK REUNION, you jackass!")
})

app.all("/*", (req, res) => {
	res.sendFile("public/templates/pagenotfound.html", {root: __dirname})
})

for (var room = 1; room <= approvedrooms; room++){
	initRoom(room)
	createRoom(room)
}

//create socket connections and such for different pages
for (var cur_namespace of TRACKED_PAGES){

	var nsp = cur_namespace + ""

	io.of(nsp).on('connection', (socket) => {

		if (checkBlackList(socket.handshake.address)){
			writeLog(socket.nsp.name, new Date(new Date().toUTCString()), socket.handshake.address, "SC_BLACKLIST")
			socket.disconnect()
			return
		}
		writeLog(socket.nsp.name, new Date(new Date().toUTCString()), socket.handshake.address, "SOCKETCONN")

		socket.on('disconnect', () => {
			if (checkBlackList(socket.handshake.address)){
				writeLog(socket.nsp.name, new Date(new Date().toUTCString()), socket.handshake.address, "DC_BLACKLIST")
				return
			}
			writeLog(socket.nsp.name, new Date(new Date().toUTCString()), socket.handshake.address, "DISCONNECT")
		})
	})

}

//app.listen(port, host)
