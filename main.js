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
const host = 'localhost'

app.use(express.static('public'));

app.get("/", (req, res) => {
	res.sendFile("public/templates/main.html", {root: __dirname})
})

app.get("/load", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var x = urlParams.get("x")
	var y = urlParams.get("y")
	var file = urlParams.get("file")
	res.sendFile("saves/" + file + "/chunk_" + x + "_" + y +".txt", {root: __dirname})
})

app.get("/gettile", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var x = urlParams.get("x")
	var y = urlParams.get("y")	
	var file = urlParams.get("file")

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
	res.sendFile("saves/" + file + "/seed.txt", {root: __dirname})	
})

app.get("/explored", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var file = urlParams.get("file")
	res.sendFile("saves/" + file + "/explored.txt", {root: __dirname})	
})

app.get("/units", (req, res) => {
	var url = req.url.split("?")[1];
	var urlParams = new URLSearchParams(url);
	var file = urlParams.get("file")
	res.sendFile("saves/" + file + "/units.txt", {root: __dirname})	
})

app.get("/peopletemplate", (req, res) => {
	res.send("P~x:xhere,y:yhere,n:nhere,m:mhere")
})

app.listen(port, host)