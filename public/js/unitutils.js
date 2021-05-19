/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

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
			reColorUnit(child, child.material.emissive.r * selectedcolorfactor, child.material.emissive.g * selectedcolorfactor, child.material.emissive.b * selectedcolorfactor)
		}
	}
	selectedunitid = id
	updateUnitBar(id)
}

function unSelectUnit(id){
	for (var child of unitlist[id].mesh.children){
		if (child.material != undefined){
			reColorUnit(child, child.material.emissive.r / selectedcolorfactor, child.material.emissive.g / selectedcolorfactor, child.material.emissive.b / selectedcolorfactor)
		}
	}
	selectedunitid = 'null'
	moving_unit = false
	document.getElementById("unit_desc").style.zIndex = "0"
	document.getElementById("unit_desc").style.display = "none"

	document.getElementById("unit_commands_info").style.zIndex = "0"
	document.getElementById("unit_commands_info").style.display = "none"
}

function updateUnitBar(id){
	document.getElementById("unit_desc").style.display = "initial"
	document.getElementById("unit_desc").style.zIndex = "2"
	document.getElementById("unit_desc_name").innerHTML = unit_corresponds[unitlist[id].type]
	if (unitlist[id].n != undefined){
		document.getElementById("unit_desc_name").innerHTML += " (" + unitlist[id].n + ")"	
	}
	document.getElementById("unit_desc_x").innerHTML = "X: " + unitlist[id].x
	document.getElementById("unit_desc_y").innerHTML = "Y: " + unitlist[id].y
	document.getElementById("unit_desc_m").innerHTML = "Movement: " + unitlist[id].m
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