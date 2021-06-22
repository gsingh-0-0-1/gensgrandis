/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function rotateUnit(coord_diff, id = selectedunitid){
	if (coord_diff[0] == -1 && coord_diff[1] == 0){
		unitlist[id].mesh.rotation.y = Math.PI / 2
	}
	if (coord_diff[0] == 1 && coord_diff[1] == 0){
		unitlist[id].mesh.rotation.y = -Math.PI / 2
	}
	if (coord_diff[0] == 0 && coord_diff[1] == 1){
		unitlist[id].mesh.rotation.y = Math.PI
	}
	if (coord_diff[0] == 0 && coord_diff[1] == -1){
		unitlist[id].mesh.rotation.y = -Math.PI
	}

	if (coord_diff[0] == -1 && coord_diff[1] == -1){
		unitlist[id].mesh.rotation.y = 3 * Math.PI / 4
	}
	if (coord_diff[0] == -1 && coord_diff[1] == 1){
		unitlist[id].mesh.rotation.y = Math.PI / 4
	}
	if (coord_diff[0] == 1 && coord_diff[1] == -1){
		unitlist[id].mesh.rotation.y = -3 * Math.PI / 4
	}
	if (coord_diff[0] == 1 && coord_diff[1] == 1){
		unitlist[id].mesh.rotation.y = -Math.PI / 4
	}
}



function onMouseClick( event ) {
	if (naming_city){
		return
	}
	if (in_tile_level_interface){
		return
	}
	var mouse = new THREE.Vector2()
	var raycaster = new THREE.Raycaster();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children, true );


	if (moving_unit){
		//moveUnit()
		//this is the code to move a unit
		//for (var i = 0; i < intersects.length; i++){
		for (var i = 0; i < intersects.length; i++){
			var obj = intersects[i].object
			if (obj.visible != true){
				continue
			}
			if (obj.istile){
				//check if the tile is adjacent
				var initx = unitlist[selectedunitid].mesh.position.x
				var inity = unitlist[selectedunitid].mesh.position.y
				var targetx = obj.position.x
				var targety = obj.position.y


				if (Math.abs(targetx - initx) == 0 && Math.abs(targety - inity) == 0){
					moving_unit = false
					updateUnitBar(selectedunitid)
					break
				}
				if (Math.abs(targetx - initx) > 1){
					break
				}
				if (Math.abs(targety - inity) > 1){
					break
				}
				if (isWater(obj.type) && unitlist[selectedunitid].naval != true){
					break
				}
				if (!isWater(obj.type) && unitlist[selectedunitid].naval == true){
					break
				}
				if (obj.height > MOUNTAIN_STONE_HEIGHT && unitlist[selectedunitid].type != "S"){
					break
				}
				if (tileHasUnit(targetx, targety)){
					unitCombat(selectedunitid, targetx, targety)
					break
				}
				if (unitlist[selectedunitid].m == 0){
					moving_unit = false
					updateUnitBar(selectedunitid)
					break
				}
				else{
					socket.emit('moveunit', selectedunitid, targetx, targety, ground_z + unit_z_offsets[unitlist[selectedunitid].type] + obj.height)

					assignTileUnitStatus(unitlist[selectedunitid].mesh.position.x, unitlist[selectedunitid].mesh.position.y, false)
					assignTileUnitStatus(targetx, targety, true, selectedunitid)

					deActivateTilesAtCenter(unitlist[selectedunitid].mesh.position.x, unitlist[selectedunitid].mesh.position.y)
					activateTilesAtCenter(targetx, targety)

					var coord_diff = [targetx - unitlist[selectedunitid].mesh.position.x, targety - unitlist[selectedunitid].mesh.position.y]

					if (unitlist[selectedunitid].type == "RB"){
						rotateUnit(coord_diff)
					}

					//move the unit
					unitlist[selectedunitid].mesh.position.x = targetx
					unitlist[selectedunitid].mesh.position.y = targety 
					unitlist[selectedunitid].x = targetx
					unitlist[selectedunitid].y = targety
					
					unitlist[selectedunitid].mesh.position.z = ground_z + unit_z_offsets[unitlist[selectedunitid].type] + obj.height
					unitlist[selectedunitid].m -= 1
					checkAndLoad(targetx, targety)

					//check for units on adjacent tile
					for (var xoff = -1; xoff <= 1; xoff++){
						for (var yoff = -1; yoff <= 1; yoff++){
							if (tileHasUnit(targetx + xoff, targety + yoff)){
								unitlist[getTileAt(targetx + xoff, targety + yoff).hasUnit_ID].mesh.visible = true
							}
						}
					}

					//check for cities on adjacent tiles
					checkForAdjacentCities(targetx, targety)
				}
				//moving_unit = false

				updateUnitBar(selectedunitid)

				break
			}
		}
		//return
	}


	//if (!moving_unit && !expanding_city){
	if (!expanding_city){
		for (var i = 0; i < 1; i++){
			var obj = intersects[i].object
			if (obj.type == "unit" && obj.unitid != selectedunitid){
				moving_unit = false
				if (selectedunitid != 'null'){
					unSelectUnit(selectedunitid)
				}

				if (unitlist[obj.unitid].owner == 'self'){
					selectUnit(obj.unitid)
				}
				else{
					alert("Not your unit!")
				}
				clearTimeout(game_init_alert)
				return
			}

			//the object that'll be clicked on will be a portion of a building
			//so the obj.parent will be that building
			//the parent of THAT will be the GLTF/GLB scene of the building
			//so the city property of the parent of the parent of the object will be true, if it is a city center or tile center
			if (obj.parent != undefined){
				if (obj.parent.parent != undefined){
					if (obj.parent.parent.city == true){
						var targetid = obj.parent.parent.cityID
						var targetx = obj.parent.parent.position.x
						var targety = obj.parent.parent.position.y
						//showCitySidebar(obj.parent.parent.cityID, obj.parent.parent.position.x, obj.parent.parent.position.y)
					}

					//or, if it's not a center building, then we look for the next parent up
					if (obj.parent.parent.parent != undefined){
						if (obj.parent.parent.parent.city == true){
							var targetid = obj.parent.parent.parent.cityID
							var targetx = obj.parent.parent.parent.position.x
							var targety = obj.parent.parent.parent.position.y
							//showCitySidebar(obj.parent.parent.parent.cityID, obj.parent.parent.parent.position.x, obj.parent.parent.parent.position.y)
						}
					}
				}
			}

			//OR, if the user clicks on a tile that has a city:
			if (obj.hasCity == true){
				var targetid = obj.tileCityID
				var targetx = obj.position.x
				var targety = obj.position.y
			}

			if (redirecting_food){
				redirectFood(targetx, targety)
				return
			}
			else{
				if (targetid != undefined && targetx != undefined && targety != undefined)
					showCitySidebar(targetid, targetx, targety)
			}
		}
	}
}