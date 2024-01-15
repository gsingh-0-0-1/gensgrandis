/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

var BARBARIAN_UNIT_IDS = []

const DIR_CHOICES = [-1, 1]

var BARBARIAN_SPAWN_CHANCE = 0.06

var MAX_TOTAL_BARBS = 6

const BARB_SPAWN_EARLIEST = 30

function changeBarbStats(){
	var val = document.getElementById("barb_diff_holder").value
	val = val * 1
	if (val == 0){
		BARBARIAN_SPAWN_CHANCE = 0
		MAX_TOTAL_BARBS = 0
		return
	}
	if (val == 1){
		BARBARIAN_SPAWN_CHANCE = 0.1
		MAX_TOTAL_BARBS = 1
		return
	}
	if (val == 2){
		BARBARIAN_SPAWN_CHANCE = 0.15
		MAX_TOTAL_BARBS = 2
		return
	}
	if (val == 3){
		BARBARIAN_SPAWN_CHANCE = 0.2
		MAX_TOTAL_BARBS = 3
		return
	}
	if (val == 4){
		BARBARIAN_SPAWN_CHANCE = 0.25
		MAX_TOTAL_BARBS = 4
		return
	}
	if (val == 5){
		BARBARIAN_SPAWN_CHANCE = 0.3
		MAX_TOTAL_BARBS = 5
		return
	}
	if (val == 6){
		BARBARIAN_SPAWN_CHANCE = 0.4
		MAX_TOTAL_BARBS = 5
		return
	}
	if (val == 7){
		BARBARIAN_SPAWN_CHANCE = 0.45
		MAX_TOTAL_BARBS = 6
		return
	}
	if (val == 8){
		BARBARIAN_SPAWN_CHANCE = 0.45
		MAX_TOTAL_BARBS = 7
		return
	}
	if (val == 9){
		BARBARIAN_SPAWN_CHANCE = 0.45
		MAX_TOTAL_BARBS = 9
		return
	}
	if (val == 10){
		BARBARIAN_SPAWN_CHANCE = 0.5
		MAX_TOTAL_BARBS = 9
		return
	}
}

function modBarbDifficulty(mod){
	if (isNaN(mod)){
		return
	}
	mod = mod * 1
	var holder = document.getElementById("barb_diff_holder")
	var val = holder.value * 1
	var n = val + mod
	if (n < 0 || n > 10){
		return
	}
	holder.value = " " + n + " "
	changeBarbStats()
}

function getAdjacentMovementVectors(xmov, ymov){
	if (xmov == -1){
		if (ymov == -1){
			return [[-1, 0], [0, -1]]
		}
		if (ymov == 0){
			return [[-1, 1], [-1, 1]]
		}
		if (ymov == 1){
			return [[-1, 0], [0, 1]]
		}
	}
	if (xmov == 0){
		if (ymov == -1){
			return [[-1, -1], [1, -1]]
		}
		if (ymov == 0){
			return NaN
		}
		if (ymov == 1){
			return [[-1, 1], [1, 1]]
		}
	}
	if (xmov == 1){
		if (ymov == -1){
			return [[1, 0], [-1, 0]]
		}
		if (ymov == 0){
			return [[1, 1], [1, -1]]
		}
		if (ymov == 1){
			return [[1, 0], [0, 1]]
		}
	}
}

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
			var availtiles = []

			for (var xoff = -1; xoff <= 1; xoff++){
				for (var yoff = -1; yoff <= 1; yoff++){
					if (!tileHasUnit(ux + xoff, uy + yoff) && checkTerrainMoveable(uid, ux + xoff, uy + yoff)){
						availtiles.push(xoff + "," + yoff)
					}
				}
			}

			if (availtiles.length == 0){
				continue
			}

			let chance = Math.random()
			if (chance < (Math.abs(targetvector[0]) / sum)){
				//var ymov = 0
				var targetx = xmov
				var targety = 0
			}
			else{
				//var xmov = 0
				var targetx = 0
				var targety = ymov
			}

			if (availtiles.includes(targetx + "," + targety)){
				moveUnit(unitlist[uid].x + targetx, unitlist[uid].y + targety, uid)
				continue
			}

			if (!availtiles.includes(targetx + "," + targety)){
				var otheroptions = getAdjacentMovementVectors(targetx, targety)
				var moved = false
				for (var option of otheroptions){
					if (availtiles.includes(option[0] + "," + option[1])){
						moveUnit(unitlist[uid].x + option[0], unitlist[uid].y + option[1], uid)
						var moved = true
						break
					}
				}
				if (!moved){
					var choice = availtiles[Math.floor(Math.random() * availtiles.length)].split(",")
					moveUnit(unitlist[uid].x + (choice[0] * 1), unitlist[uid].y + (choice[1] * 1), uid)
					continue
				}
			}

		}
	}

	var chance = Math.random()
	if (chance < BARBARIAN_SPAWN_CHANCE && BARBARIAN_UNIT_IDS.length < MAX_TOTAL_BARBS){
		spawnBarbarian()
	}
}