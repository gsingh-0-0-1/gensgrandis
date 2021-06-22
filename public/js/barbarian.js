/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

var BARBARIAN_UNIT_IDS = []

const DIR_CHOICES = [-1, 1]

const BARBARIAN_SPAWN_CHANCE = 0.1

const MAX_TOTAL_BARBS = 12

const BARB_SPAWN_EARLIEST = 20

function spawnBarbarian(){
	var c_id = Math.random() * cities.length
	var c_id = Math.floor(c_id)
	var city = cities[c_id]
	var dir = [DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)], DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)]]

	//traverse out from the city to find a spawn location
	var initx = city.center.x
	var inity = city.center.y
	var curx = initx
	var cury = inity

	while (activetiles.includes(curx + "," + cury)){
		var curx = curx + dir[0]
		var cury = cury + dir[1]
	}

	if (isWater(getTileAt(curx, cury).type)){
		return
	}

	addLegion(curx, cury, "Barbarian")
	unitlist[unitlist.length - 1].tc = c_id
	BARBARIAN_UNIT_IDS.push(unitlist.length - 1)
}

function meetsPillageReqs(x, y){
	var data = getCityTileData(x, y)

	//requirements
	if (data.population <= 30){
		return false
	}

	return true
}

function pillageTile(uid){
	var x = unitlist[uid].x
	var y = unitlist[uid].y

	var data = getCityTileData(x, y)

	//decimate the population (literally, decimate; kill 10%)
	data.population = Math.round(data.population * 0.9)
	if (selectedunitid != null && selectedunitid != 'null'){
		updateUnitBar(selectedunitid)
	}
}

function barbarianAI(){
	if (TURN_COUNTER < BARB_SPAWN_EARLIEST){
		return
	}

	if (cities.length == 0){
		return
	}

	for (var uid of BARBARIAN_UNIT_IDS){
		if (unitlist[uid] == 'removed'){
			continue
		}

		var targetvector = []

		var ux = unitlist[uid].x
		var uy = unitlist[uid].y

		if (isTileCity(ux, uy)){
			if (meetsPillageReqs(ux, uy)){
				pillageTile(uid)
				continue
			}
		}

		targetvector.push(cities[unitlist[uid].tc].center.x - unitlist[uid].x)
		targetvector.push(cities[unitlist[uid].tc].center.y - unitlist[uid].y)
		var sum = Math.abs(targetvector[0]) + Math.abs(targetvector[1])
		/*
		if (sum == 0){
			var randx = DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)] * Math.round(Math.random())
			var randy = DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)]
			if (randx != 0){
				var randy = randy * Math.round(Math.random())
			}
			moveUnit(unitlist[uid].x + randx, unitlist[uid].y + randy, uid)
			continue
		}*/

		var xmov = targetvector[0] / Math.abs(targetvector[0])
		var ymov = targetvector[1] / Math.abs(targetvector[1])
		for (var rep = 0; rep < unit_movements[unitlist[uid].type]; rep++){

			//get all tiles that the unit can move to
			var ux = unitlist[uid].x
			var uy = unitlist[uid].y

			for (var xoff = -1; xoff <= 1; xoff++){
				for (var yoff = -1; yoff <= 1; yoff++){

				}
			}

			let chance = Math.random()
			if (chance < (Math.abs(targetvector[0]) / sum)){
				//var ymov = 0
				var targetx = unitlist[uid].x + xmov
				var targety = unitlist[uid].y
			}
			else{
				//var xmov = 0
				var targetx = unitlist[uid].x
				var targety = unitlist[uid].y + ymov
			}

			console.log(targetx, targety, uid)

			moveUnit(targetx, targety, uid)

		}
	}

	var chance = Math.random()
	if (chance < BARBARIAN_SPAWN_CHANCE && BARBARIAN_UNIT_IDS.length < MAX_TOTAL_BARBS){
		spawnBarbarian()
	}
}