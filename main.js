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
const host = ''

server.listen(port, host);

const accesscodes = []
var rooms = []
var approvedrooms = 10
var current_clients = new Object();

function dealWithMalformed(res){
	//rickroll those hackers
	res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
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

function createRoom(room){
	io.of("/room/" + room).on("connection", (socket) => {

		socket.on('join', (username) => {
			socket.emit('join', username)
			socket.broadcast.emit('join', username)

			if (current_clients[room] == undefined){
				current_clients[room] = new Object()
			}

			current_clients[room][socket.id] = username
			var l = Object.values(current_clients[room])
			updateUsers(socket, l)

		});

		socket.on('chat message', (msg, username) => {
			//emit back to the client
			socket.emit('chat message', msg, username)
			//broadcast to all with appropriate username
			socket.broadcast.emit('chat message', msg, username);
		});

		socket.on('disconnect', () => {
			socket.broadcast.emit('leave', current_clients[room][socket.id])
			delete current_clients[room][socket.id]
			var l = Object.values(current_clients[room])
			updateUsers(socket, l)
		})
	});
}

app.use(express.static('public'));



//the first catch-all, meant for logging and such
app.get("/*", (req, res, next) => {
	var ip = req.connection.remoteAddress;
	if (req.url.includes('gettile')){
		return next();
	}
	console.log("Connection to " + req.url + " at ", new Date(new Date().toUTCString()), " from ", ip)
	return next();
})


//these routes below are exempt from any checks
app.get("/", (req, res) => {
	res.sendFile("public/templates/landing.html", {root: __dirname})
})

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
	//res.send("Currently disabled.")
	var room = req.params.id
	if (isNaN(room)){
		dealWithMalformed(res)
		return
	}

	room = room * 1


	//set up socket function for the room if it doesn't already exist
	if (!rooms.includes(room) && room <= approvedrooms && room > 0){
		createRoom(room)
		rooms.push(room)
	}

	if (rooms.includes(room)){
		res.sendFile("public/templates/chatroom.html", {root: __dirname})
	}
	else{
		res.send("Room not authorized.")
	}
});

app.get("/game", (req, res) => {
	var ip = req.connection.remoteAddress;
	console.log("Connection to '/game' at ", new Date(new Date().toUTCString()), " from ", ip)
	res.sendFile("public/templates/main.html", {root: __dirname})
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