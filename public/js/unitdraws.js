/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function removeUnit(id){
	if (unitlist[id].owner == "Barbarian"){
		BARBARIAN_UNIT_IDS.splice(BARBARIAN_UNIT_IDS.indexOf(id), -1)
	}

	if (unitlist[id].owner == 'self'){
		deActivateTilesAtCenter(unitlist[id].x, unitlist[id].y)
	}

	scene.remove(unitlist[id].mesh)

	assignTileUnitStatus(unitlist[id].x, unitlist[id].y, false)

	var temp_id = id

	unSelectUnit(temp_id)

	unitlist[temp_id] = 'removed'

	socket.emit('removeunit', id)

}

function addOwnerSymbol(id){
	var col = new THREE.Color(0.3, 0.3, 0.7)
	if (unitlist[id].owner == 'self'){
		var col = new THREE.Color(0.1, 0.4, 0.1)
	}
	if (unitlist[id].owner == 'Barbarian'){
		var col = new THREE.Color(0.8, 0.15, 0.15)
	}

	var geo = new THREE.OctahedronGeometry(0.05)
	var geo = new THREE.BufferGeometry().fromGeometry(geo)
	var mat = new THREE.MeshBasicMaterial({color: col})
	var mesh = new THREE.Mesh(geo, mat)
	mesh.position.set(0, 0.5, 0)
	unitlist[id].mesh.add(mesh)
}

function finalizeUnit(unit){
	if (unit.owner == 'self'){
		exploreAtCoords(unit.x, unit.y)
	}
	addOwnerSymbol(unit.unitid)
}

//PEOPLE
function addPeople(x, y, owner = 'self'){
	//console.log(units)
	units.push(people_template.replace("xhere", x).replace("yhere", y).replace("ohere", owner))
	drawUnits(units.length - 1)
}

function drawPeople(x, y, id, vis = true){

	var people = PEOPLE_LOADED_MESH.clone()

	people.scale.set(1, 1, 1)
	people.position.set(x, y, ground_z + 1)

	//var people = gltf.scene
	scene.add( people );

	var hoffset = getTileAt(x, y).height

	people.position.set(x, y, ground_z + hoffset + unit_z_offsets["P"])
	people.rotation.set(Math.PI / 2, 0, 0)

	people.type = "unit"

	people.visible = vis
	assignUnitID(people, id)
	//people.unitid = id

	unitlist[id].mesh = people
	unitlist[id].naval = false

	finalizeUnit(unitlist[id])
		//}
	//)

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}

}


//RIVERBOAT
function addRiverboat(x, y, owner = 'self'){
	units.push(riverboat_template.replace("xhere", x).replace("yhere", y).replace("ohere", owner))
	drawUnits(units.length - 1)
}

function drawRiverboat(x, y, id, vis = true){

	var boat = RIVERBOAT_LOADED_MESH.clone()

	boat.scale.set(0.07, 0.07, 0.07)
	boat.position.set(x, y, ground_z + 0.2)


	//var boat = gltf.scene
	scene.add( boat );

	var hoffset = getTileAt(x, y).height

	boat.position.set(x, y, ground_z + hoffset + unit_z_offsets["RB"])
	boat.rotation.set(Math.PI / 2, Math.PI / 2, 0)

	boat.type = "unit"

	boat.visible = vis
	assignUnitID(boat, id)

	unitlist[id].mesh = boat
	unitlist[id].naval = true

	finalizeUnit(unitlist[id])

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}



//LEGION
function addLegion(x, y, owner = 'self'){
	units.push(legion_template.replace("xhere", x).replace("yhere", y).replace("ohere", owner))
	drawUnits(units.length - 1)
}


function drawLegion(x, y, id, vis = true){

	var legion = LEGION_LOADED_MESH.clone()

	legion.scale.set(1, 1, 1)

	legion.position.set(x, y, ground_z + 1)


	//var legion = gltf.scene
	scene.add( legion );

	var hoffset = getTileAt(x, y).height

	legion.position.set(x, y, ground_z + hoffset + unit_z_offsets["L"])
	legion.rotation.set(Math.PI / 2, Math.PI, 0)

	legion.type = "unit"

	legion.visible = vis
	assignUnitID(legion, id)

	unitlist[id].mesh = legion
	unitlist[id].naval = false

	finalizeUnit(unitlist[id])

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}


//SCOUT
function addScout(x, y, owner = 'self'){
	units.push(scout_template.replace("xhere", x).replace("yhere", y).replace("ohere", owner))
	drawUnits(units.length - 1)
}

function drawScout(x, y, id, vis = true){

	var scout = SCOUT_LOADED_MESH.clone()

	scout.scale.set(1, 1, 1)

	scout.position.set(x, y, ground_z + 1)


	//var legion = gltf.scene
	scene.add( scout );

	var hoffset = getTileAt(x, y).height

	scout.position.set(x, y, ground_z + hoffset + unit_z_offsets["S"])
	scout.rotation.set(Math.PI / 2, Math.PI, 0)

	scout.type = "unit"

	scout.visible = vis
	assignUnitID(scout, id)

	unitlist[id].mesh = scout
	unitlist[id].naval = false

	finalizeUnit(unitlist[id])

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}


//EXPLORER
function addExplorer(x, y, owner = 'self'){
	units.push(explorer_template.replace("xhere", x).replace("yhere", y).replace("ohere", owner))
	drawUnits(units.length - 1)
}

function drawExplorer(x, y, id, vis = true){

	var exp = EXPLORER_LOADED_MESH.clone()

	exp.scale.set(1, 1, 1)

	exp.position.set(x, y, ground_z + 1)


	scene.add( exp );

	var hoffset = getTileAt(x, y).height

	exp.position.set(x, y, ground_z + hoffset + unit_z_offsets["E"])
	exp.rotation.set(Math.PI / 2, Math.PI, 0)

	exp.type = "unit"

	exp.visible = vis
	assignUnitID(exp, id)

	unitlist[id].mesh = exp
	unitlist[id].naval = false

	finalizeUnit(unitlist[id])

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}