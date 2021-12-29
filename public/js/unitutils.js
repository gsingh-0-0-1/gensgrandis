/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function moveUnit(targetx, targety, id){
	var curx = unitlist[id].x
	var cury = unitlist[id].y

	if (unitlist[id].m <= 0){
		return
	}

	if (tileHasUnit(targetx, targety)){
		return
	}

	if (isWater(getTileAt(targetx, targety).type) && unitlist[id].naval == false){
		return
	}

	if (!isWater(getTileAt(targetx, targety).type) && unitlist[id].naval == true){
		return
	}

	assignTileUnitStatus(unitlist[id].mesh.position.x, unitlist[id].mesh.position.y, false)
	assignTileUnitStatus(targetx, targety, true, id)

	if (unitlist[id].owner == 'self'){
		deActivateTilesAtCenter(unitlist[selectedunitid].mesh.position.x, unitlist[selectedunitid].mesh.position.y)
		activateTilesAtCenter(targetx, targety)
	}

	unitlist[id].x = targetx
	unitlist[id].y = targety

	unitlist[id].mesh.position.x = targetx
	unitlist[id].mesh.position.y = targety
	unitlist[id].mesh.position.z = ground_z + getTileAt(targetx, targety).height + unit_z_offsets[unitlist[id].type]

	if (unitlist[id].owner != 'self' && activetiles.includes(targetx + "," + targety)){
		unitlist[id].mesh.visible = true
	}

	if (unitlist[id].owner != 'self' && !activetiles.includes(targetx + "," + targety)){
		unitlist[id].mesh.visible = false
	}

	unitlist[id].m -= 1
}

function assignUnitID(obj, id){
	for (var i = 0; i < obj.children.length; i++) {
		var child = obj.children[i];
		assignUnitID(child, id);
		child.unitid = id;
		child.type = "unit"
	}
}

function reColorUnit(obj, r, g, b){
	obj.material.emissive.r = r
	obj.material.emissive.g = g
	obj.material.emissive.b = b

	for (var i = 0; i < obj.children.length; i++){
		var child = obj.children[i]
		reColorUnit(child, r, g, b)
		child.material.emissive.r = r
		child.material.emissive.g = g
		child.material.emissive.b = b
	}
}

function selectUnit(id){
	for (var child of unitlist[id].mesh.children){
		if (child.material != undefined){
			//reColorUnit(child, child.material.emissive.r * selectedcolorfactor, child.material.emissive.g * selectedcolorfactor, child.material.emissive.b * selectedcolorfactor)
		}
	}
	selectedunitid = id
	showUnitSelectRings(id)
	updateUnitBar(id)
}

function unSelectUnit(id){
	for (var child of unitlist[id].mesh.children){
		if (child.material != undefined){
			//reColorUnit(child, child.material.emissive.r / selectedcolorfactor, child.material.emissive.g / selectedcolorfactor, child.material.emissive.b / selectedcolorfactor)
		}
	}
	selectedunitid = 'null'
	moving_unit = false
	hideUnitSelectRings()
	document.getElementById("unit_desc").style.zIndex = "0"
	document.getElementById("unit_desc").style.display = "none"

	document.getElementById("unit_commands_info").style.zIndex = "0"
	document.getElementById("unit_commands_info").style.display = "none"
}

function updateUnitBar(id){
	document.getElementById("unit_desc").style.display = "initial"
	document.getElementById("unit_desc").style.zIndex = "2"
	document.getElementById("unit_desc_name").innerHTML = unit_corresponds[unitlist[id].type]
	if (unit_strengths[unitlist[id].type] != null || unit_strengths[unitlist[id].type] != undefined){
		document.getElementById("unit_desc_name").innerHTML += " (&#9876; " + (Math.round((unit_strengths[unitlist[id].type] - unitlist[id].damage) * 100) / 100) + ")"
	}
	if (unitlist[id].n != undefined){
		document.getElementById("unit_desc_name").innerHTML += " (" + unitlist[id].n + ")"	
	}
	document.getElementById("unit_desc_x").innerHTML = "X: " + unitlist[id].x
	document.getElementById("unit_desc_y").innerHTML = "Y: " + unitlist[id].y
	document.getElementById("unit_desc_m").innerHTML = "Movement: " + unitlist[id].m
	if (unitlist[id].m == 0){
		document.getElementById("unit_desc_m").innerHTML += " (End turn)"
	}
	if (moving_unit){
		document.getElementById("unit_desc_status").innerHTML = "Status: Moving"
	}
	else{
		document.getElementById("unit_desc_status").innerHTML = "Status: Idling"
	}

	document.getElementById("unit_commands_info").style.display = "initial"
	document.getElementById("unit_commands_info").style.zIndex = "2"
	document.getElementById("unit_specific_commands").innerHTML = unit_commands[unitlist[id].type]
}