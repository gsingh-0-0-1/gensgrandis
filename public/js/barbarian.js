/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

var BARBARIAN_UNIT_IDS = []

const DIR_CHOICES = [-1, 1]

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

	addLegion(curx, cury, "Barbarian")
	unitlist[unitlist.length - 1].tc = c_id
	BARBARIAN_UNIT_IDS.push(unitlist.length - 1)
}

function barbarianAI(){
	if (TURN_COUNTER < 0){
		return
	}

	if (cities.length == 0){
		return
	}

	for (var uid of BARBARIAN_UNIT_IDS){
		let targetvector = []

		targetvector.push(cities[unitlist[uid].tc].center.x - unitlist[uid].x)
		targetvector.push(cities[unitlist[uid].tc].center.y - unitlist[uid].y)
		let sum = Math.abs(targetvector[0]) + Math.abs(targetvector[1])

		if (sum == 0){
			var randx = DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)] * Math.round(Math.random())
			var randy = DIR_CHOICES[Math.floor(Math.random() * DIR_CHOICES.length)]
			if (randx != 0){
				var randy = randy * Math.round(Math.random())
			}
			moveUnit(unitlist[uid].x + randx, unitlist[uid].y + randy, uid)
			continue
		}

		let xmov = targetvector[0] / Math.abs(targetvector[0])
		let ymov = targetvector[1] / Math.abs(targetvector[1])
		for (var rep = 0; rep < unit_movements[unitlist[uid].type]; rep++){
			let chance = Math.random()
			if (chance < (Math.abs(targetvector[0]) / sum)){
				moveUnit(unitlist[uid].x + xmov, unitlist[uid].y, uid)
			}
			else{
				moveUnit(unitlist[uid].x, unitlist[uid].y + ymov, uid)
			}
		}
	}

	//1 in 5 chance of spawning a new barbarian unit for a city each turn
	var chance = Math.random()
	if (chance < 0.2){
		spawnBarbarian()
	}
}