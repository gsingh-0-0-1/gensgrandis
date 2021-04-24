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
				if (obj.height > MOUNTAIN_STONE_HEIGHT){
					break
				}
				if (tileHasUnit(targetx, targety)){
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

					//hide units that are no longer visible
					for (var xoff = -1; xoff <= 1; xoff++){
						for (var yoff = -1; yoff <= 1; yoff++){
							if (tileHasUnit(unitlist[selectedunitid].mesh.position.x + xoff, unitlist[selectedunitid].mesh.position.y + yoff)){
								if (unitlist[getTileAt(unitlist[selectedunitid].mesh.position.x + xoff, unitlist[selectedunitid].mesh.position.y + yoff).hasUnit_ID].owner == 'self'){
									continue
								}
								if (activetiles.includes((unitlist[selectedunitid].mesh.position.x + xoff) + "," + (unitlist[selectedunitid].mesh.position.y + yoff))){
									continue
								}
								unitlist[getTileAt(unitlist[selectedunitid].mesh.position.x + xoff, unitlist[selectedunitid].mesh.position.y + yoff).hasUnit_ID].mesh.visible = false
							}
						}
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
		return
	}


	if (!moving_unit && !expanding_city){
		for (var i = 0; i < 1; i++){
			var obj = intersects[i].object
			if (obj.type == "unit" && obj.unitid != selectedunitid){
				if (selectedunitid != 'null'){
					unSelectUnit(selectedunitid)
				}

				if (unitlist[obj.unitid].owner == 'self'){
					selectUnit(obj.unitid)
				}
				else{
					alert("Not your unit!")
				}
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
				showCitySidebar(targetid, targetx, targety)
			}

		}
	}
}