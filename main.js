/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
/*/


const express = require('express')
var fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const {URLSearchParams} = require('url')

const app = express()
const port = 80
const host = '192.168.86.35'

const accesscodes = ['!mgvs0_55lk', "!hjys_6kj3l:"]

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

app.use(express.static('public'));

app.get("/", (req, res) => {
	res.sendFile("public/templates/landing.html", {root: __dirname})
})

app.get("/access", (req, res) => {
	res.sendFile("public/templates/access.html", {root: __dirname})
})

app.get("/*", (req, res, next) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var codeparam = urlParams.get("accesscode")
	if (accesscodes.includes(codeparam)){
		return next();
	}
	else{
		dealWithMalformed(res)
	}
})

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

app.listen(port, host)