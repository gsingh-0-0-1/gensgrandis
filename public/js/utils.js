/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function showCustomAlert(id){
	document.getElementById(id).style.display = "initial"
}

function closeCustomAlert(obj){
	obj.style.display = "none"
}

function isTileAdjacentToWater(x, y){
	if (isWater(getTileAt(x + 1, y).type)){
		return true
	}
	if (isWater(getTileAt(x - 1, y).type)){
		return true
	}
	if (isWater(getTileAt(x, y + 1).type)){
		return true
	}
	if (isWater(getTileAt(x, y - 1).type)){
		return true
	}
	return false
}

function isTileActiveBySelfUnit(x, y){
	for (var xoff = -1; xoff <= 1; xoff++){
		for (var yoff = -1; yoff <= 1; yoff++){
			var tile = getTileAt(x + xoff, y + yoff)
			if (tileHasUnit(x + xoff, y + yoff)){
				if (unitlist[tile.hasUnit_ID].owner == 'self'){
					return true
				}
			}
		}
	}
	return false
}

function isTileAdjacentToSelfCity(x, y){
	for (var yoff = -1; yoff <= 1; yoff ++){
		for (var xoff = -1; xoff <= 1; xoff++){
			if (getTileAt(x + xoff, y + yoff) == undefined){
				continue
			}
			if (getTileAt(x + xoff, y + yoff).hasCity){
				if (cities[getTileAt(x + xoff, y + yoff).tileCityID].owner == 'self'){
					return true
				}
			}
		}
	}
	return false
}

function isCityCenter(cityID, x, y){
	if (cities[cityID].center.x == x && cities[cityID].center.y == y){
		return true
	}
	return false
}

function assignCity(x, y, id, mesh){
	grid_dict["tile_" + x + "_" + y].hasCity = true
	grid_dict["tile_" + x + "_" + y].tileCityID = id * 1
	grid_dict["tile_" + x + "_" + y].cityMesh = mesh
}

function isTileCity(x, y){
	if (grid_dict["tile_" + x + "_" + y] == undefined){
		return false
	}
	if (grid_dict["tile_" + x + "_" + y].hasCity == true){
		return true
	}
	return false
}

function getCityTileData(x, y){
	var c_id = getTileAt(x, y).tileCityID

	if (isCityCenter(c_id, x, y)){
		var data = cities[c_id].center
	}
	else{
		var data = cities[c_id].tiles[x + "_" + y]
	}

	return data
}

function tileHasUnit(x, y){
	if (grid_dict["tile_" + x + "_" + y] == undefined){
		return false
	}
	if (grid_dict["tile_" + x + "_" + y].hasUnit == true){
		return true
	}
	return false
}

function checkTerrainMoveable(id, x, y){
	if (unitlist[id].naval == true){
		if (isWater(getTileAt(x, y).type)){
			return true
		}
		else{
			return false
		}
	}
	else{
		if (isWater(getTileAt(x, y).type)){
			return false
		}
		else{
			return true
		}
	}
}

function assignTileUnitStatus(x, y, stat, id='null'){
	var tile = "tile_" + x + "_" + y
	var gtile = grid_dict[tile]
	gtile.hasUnit = stat
	if (stat != true){
		gtile.hasUnit_ID = null
	}
	else{
		gtile.hasUnit_ID = id
	}
}

function assignTileFood(x, y){

	if (getTileAt(x, y).basefood != undefined){
		return
	}

	var base = 400

	if (isForest(getTileAt(x, y).type)){
		base = 150
	}

	if (getTileAt(x, y).type == DESERT_TILE_CODE){
		base = 74
	}

	if (isTileAdjacentToWater(x, y)){
		base += 300
	}

	var height = getTileAt(x, y).height

	base = base * (MOUNTAIN_STONE_HEIGHT - height) / MOUNTAIN_STONE_HEIGHT

	if (base < 0){
		base = 0
	}

	getTileAt(x, y).basefood = base
}

function getNextPopGrowth(availfood, m = 10, f = 1.1){
	return Math.floor( (2 * m * (1 / (1 + (f ** -availfood)) - 0.5)) )
}

function getHutOffset(x, y, size){
	/*var xm = ((10 * x) % 100) + 10
	var ym = ((10 * y) % 100) + 10
	var sm = (WORLD_SEED % 19) + 1

	var xoff = 1/2.5 * Math.sin(3 * size + sm)
	var yoff = 1/2.5 * Math.cos(sm * ym * size + sm)*/

	var xoff = (x * size) + (y * WORLD_SEED)
	var yoff = (y * size) + (x * WORLD_SEED)

	var xm = 131
	var ym = 92
	var tol = 0.9

	var xoff = tol * ((xoff % xm) - xm/2) / xm
	var yoff = tol * ((yoff % ym) - ym/2) / ym

	/*if (Math.abs(xoff) < 0.05){
		xoff *= 2
	}
	if (Math.abs(yoff) < 0.05){
		yoff *= 2
	}*/

	return [xoff, yoff]
}


function updateCityCenterTradingPanel(){
	var citycentertrading = document.getElementById("city_center_trading")
	citycentertrading.style.display = "initial"
	citycentertrading.style.zIndex = 2
	citycentertrading.textContent = ''

	for (var city of cities){
		//for (var i = 0; i < 10; i++){
			var centertile = city.center.x + "," + city.center.y
			if (city.center.mesh.visible != true){
				continue
			}
			var c_el = document.createElement('div')
			c_el.textContent = city.name

			var rd_button = document.createElement('input')
			rd_button.id = city.center.x + "_" + city.center.y + "_center_redirect_button"
			rd_button.type = "button"
			rd_button.value = "Send >>"
			rd_button.style.float = "right"
			rd_button.onclick = function(){
				redirectFood(city.center.x + '', city.center.y + '', true);
				return false
			}
			c_el.appendChild(rd_button)
			/*c_el.style.position = "relative"
			c_el.style.width = "100%"
			c_el.style.left = "0%"
			c_el.style.color = "#bbb"
			c_el.style.fontSize = "1.6vh"
			c_el.style.padding = "2px 2px"
			c_el.style.fontFamily = "Verdana"*/
			citycentertrading.appendChild(c_el)
		//}
	}

	var ti = document.createElement('input')
	ti.id = "citycentertrading_input"
	ti.style.position = "fixed"
	ti.style.border = "none"
	ti.style.left = "calc(60% + 5px)"
	ti.style.bottom = "calc(80% + 5px)"
	ti.style.height = "2%"
	ti.style.width = "calc(20% - 5px)"
	ti.placeholder = "Send Food (amount) >>"
	ti.style.color = "#000"
	ti.style.backgroundColor = "#aad"
	citycentertrading.appendChild(ti)

	var q = document.createElement('span')
	q.className = 'button questionmarkbox'
	q.type = 'button'
	q.innerHTML = "?<span class='hoverinfo' style='left: -4vw; background-color: #666'>To re-route food to another city, select the tile you want to take food from. Then, type the amount of food you want to send in the box, and hit the " + '"Send"' + " button next to your desired city.</span>"
	q.style.position = "fixed"
	q.style.left = "74%"
	q.style.bottom = "80.3%"
	citycentertrading.appendChild(q)

	//f.innerHTML = "<span class='button questionmarkbox' type='button'>?<span class='hoverinfo'>See a 2-D view of your city.</span></span>"

	var refresh = document.createElement('input')
	refresh.type = 'button'
	refresh.value = 'Refresh List'
	refresh.style.position = "absolute"
	refresh.style.right = "0"
	refresh.style.bottom = "0"
	refresh.style.fontSize = "0.55vw"
	refresh.style.width = "auto"
	refresh.onclick = function(){
		updateCityCenterTradingPanel();
		return false
	}
	citycentertrading.appendChild(refresh)
}


function showCitySidebar(this_city_ID, tilex, tiley){
	if (cities[this_city_ID].owner != 'self'){
		alert("Not your city!")
		return
	}
	tilex = Math.round(tilex)
	tiley = Math.round(tiley)

	viewing_city_sidebar = true
	selectedcityid = this_city_ID
	selectedcitytilex = tilex
	selectedcitytiley = tiley
	var sidebar = document.getElementById("city_info_sidebar")
	sidebar.style.display = "initial"
	sidebar.style.zIndex = 2

	updateCityCenterTradingPanel()

	tileoutline.visible = true
	tileoutline.position.set(tilex, tiley, ground_z + getTileAt(tilex, tiley).height)
	/*if (tileoutline != 'null'){
		scene.remove(tileoutline)
	}
	tileoutline = new THREE.BoxHelper( getTileAt(selectedcitytilex, selectedcitytiley), 0xaa0000 );
	scene.add(tileoutline)*/

	//outlinePass.selectedObjects = [getTileAt(selectedcitytilex, selectedcitytiley)];
	
	//getTileAt(selectedcitytilex, selectedcitytiley).material.wireframe = true
	//getTileAt(selectedcitytilex, selectedcitytiley).material.side = THREE.BackSide

	var centerx = cities[this_city_ID].center.x
	var centery = cities[this_city_ID].center.y

	document.getElementById("city_info_sidebar_name").innerHTML = cities[this_city_ID].name + " (Pop: " + getTotalPop(this_city_ID) + ")"

	document.getElementById("city_info_sidebar_center_loc_x").innerHTML = "X: " + centerx
	document.getElementById("city_info_sidebar_center_loc_y").innerHTML = "Y: " + centery

	document.getElementById("city_info_sidebar_selected_loc_x").innerHTML = "X: " + tilex
	document.getElementById("city_info_sidebar_selected_loc_y").innerHTML = "Y: " + tiley

	document.getElementById("city_info_sidebar_selected_food").innerHTML = "Tile Food: " + Math.round(getTileAt(selectedcitytilex, selectedcitytiley).basefood, 2)
	document.getElementById("city_info_sidebar_selected_farm_food").innerHTML = "Farm Food: " + Math.round(getTileFarmFood(selectedcitytilex, selectedcitytiley), 2)

	document.getElementById("city_info_sidebar_selected_pop").innerHTML = "Population: "


	//[ <span id="city_info_sidebar_people_turns"></span> / <span id="city_info_sidebar_prod_target"></span> ] -- <span id="city_info_sidebar_prod_unit"></span>

	document.getElementById("city_info_sidebar_progress_reg").textContent =    0
	document.getElementById("city_info_sidebar_prod_target_reg").textContent = 0
	document.getElementById("city_info_sidebar_prod_unit_reg").textContent =   ''

	document.getElementById("city_info_sidebar_progress_mil").textContent =    0
	document.getElementById("city_info_sidebar_prod_target_mil").textContent = 0
	document.getElementById("city_info_sidebar_prod_unit_mil").textContent =   ''

	if (cities[this_city_ID].producing["reg"] != null){
		document.getElementById("city_info_sidebar_progress_reg").textContent = cities[this_city_ID].production_progress["reg"]
		document.getElementById("city_info_sidebar_prod_target_reg").textContent = unit_produce_times[cities[this_city_ID].producing["reg"]]
		document.getElementById("city_info_sidebar_prod_unit_reg").textContent = unit_corresponds[cities[this_city_ID].producing["reg"]]
	}
	if (cities[this_city_ID].producing["mil"] != null){
		document.getElementById("city_info_sidebar_progress_mil").textContent = cities[this_city_ID].production_progress["mil"]
		document.getElementById("city_info_sidebar_prod_target_mil").textContent = unit_produce_times[cities[this_city_ID].producing["mil"]]
		document.getElementById("city_info_sidebar_prod_unit_mil").textContent = unit_corresponds[cities[this_city_ID].producing["mil"]]
	}

	if (centerx == tilex && centery == tiley){
		document.getElementById("city_info_sidebar_selected_pop").innerHTML += Math.round(cities[this_city_ID].center.population)
	}
	else{
		document.getElementById("city_info_sidebar_selected_pop").innerHTML += Math.round(cities[this_city_ID].tiles[tilex + "_" + tiley].population)
	}

	if (in_city_tile_view){
		showCityTileView(this_city_ID)
	}

}

function hideCitySidebar(){
	tileoutline.visible = false
	//scene.remove(tileoutline)
	//tileoutline = 'null'
	//outlinePass.selectedObjects = []
	//getTileAt(selectedcitytilex, selectedcitytiley).material.wireframe = false
	viewing_city_sidebar = false
	selectedcityid = 'null'
	selectedcitytilex = 'null'
	selectedcitytiley = 'null'
	var sidebar = document.getElementById("city_info_sidebar")
	sidebar.style.display = "none"
	sidebar.style.zIndex = 0

	var citycentertrading = document.getElementById("city_center_trading")
	citycentertrading.style.display = "initial"
	citycentertrading.style.zIndex = 0

	//document.getElementById("city_info_sidebar_name").innerHTML = ''
}

function handleCityNameInput(event){
	if (event.keyCode == enterkeycode){
		let name = document.getElementById("city_name_input_box").value
		name = name.replaceAll('"', '').replaceAll("'", '');

		if (name.replaceAll(" ", '') === ''){
			return
		}
		if (name[0] == ''){
			return
		}

		if (name.length < 1){
			return
		}
		if (citynames.includes(name)){
			return
		}
		citynames.push(name)
		current_city.name = name
		current_city.center.mesh.cityname = name
		current_city.cityID = cities.length
		cities.push(current_city)

		naming_city = false
		hideCityNamePanel()
		socket.emit('buildcity', document.getElementById("city_naming_id").value, name)
	}
	/*else{
		let val = document.getElementById("city_name_input_box").value
		if (val.length > 20){
			document.getElementById("city_name_input_box").value = val.slice(0, -1)
		}
	}*/
}

function checkForAdjacentCities(targetx, targety){
	for (var xoff = -1; xoff <= 1; xoff++){
		for (var yoff = -1; yoff <= 1; yoff++){
			if (isTileCity(targetx + xoff, targety + yoff)){
				var id = grid_dict["tile_" + (targetx + xoff) + "_" + (targety + yoff)].tileCityID
				if (isCityCenter(id, targetx + xoff, targety + yoff)){
					cities[id].center.mesh.visible = true
					if (viewing_city_sidebar){
						showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)
					}
				}
				else{
					cities[id].tiles[(targetx + xoff) + "_" + (targety + yoff)].mesh.visible = true
				}
			}
		}
	}
}

function showCityNamePanel(id){
	document.getElementById("city_name_input_container").style.display = "initial"
	document.getElementById("city_name_input_container").style.zIndex = "2"
	document.getElementById("city_name_input_box").value = ''
	document.getElementById("city_naming_id").value = id
	document.getElementById("city_name_input_box").focus()
}

function hideCityNamePanel(){
	document.getElementById("city_name_input_container").style.display = "none"
	document.getElementById("city_name_input_container").style.zIndex = "0"
	document.getElementById("city_name_input_box").value = ''
}

function updateCityLabels(show=false){
	for (var city_iter = 0; city_iter < cities.length; city_iter++){
		var city = cities[city_iter]

		if (show){
			console.log(city)
		}

		if (city.center.mesh.visible == false){
			continue
		}

		if (show){
			console.log("here")
		}

		var pos = new THREE.Vector3()
		var offset = 0.4
		if (cameralooking == "back"){
			offset = -0.4
		}
		pos.x = city.center.mesh.position.x + offset
		pos.y = city.center.mesh.position.y - offset
		pos.z = city.center.mesh.position.z

		var d = document.getElementById("city_" + city.name)

		if (d == null){
			var d = document.createElement('div')
			d.id = "city_" + city.name

			document.body.appendChild(d)

			var d = document.getElementById("city_" + city.name)
			d.style.color = "#222"
			d.style.fontFamily = "Verdana"
			d.style.backgroundColor = "#aa7710"
			d.style.borderRadius = "2px"

			d.style.width = "auto"

			d.style.position = "fixed"
			d.style.zIndex = 1

			d.innerHTML = city.name
		}

		pos.project( camera );
		pos.x = Math.round(( pos.x + 1) * window.innerWidth / 2);
		pos.y = Math.round(- ( pos.y - 1) * window.innerHeight / 2);

		d.style.left = pos.x + "px"
		d.style.top = pos.y + "px"
		//console.log(pos)
	}
}

//var leaves_geometry = new THREE.BufferGeometry().fromGeometry(new THREE.ConeGeometry( leavesrad, leavesheight, 3 ));

function drawTree(coords, tileheight, num){
	var i = coords[0]
	var j = coords[1]

	var xoff = (( Math.pow(tileheight + num*j, num) * WORLD_SEED * i * j) % 2000) - 1000
	var yoff = (( Math.pow(tileheight + num*i, num) * WORLD_SEED / i / j) % 2000) - 1000

	xoff /= 2000
	yoff /= 2000
	/*var trunk_geometry = new THREE.CylinderGeometry(trunkrad, trunkrad, trunkheight, 8)
	var trunk_material = new THREE.MeshBasicMaterial( {color: 0x654321} )
	var trunk = new THREE.Mesh( trunk_geometry, trunk_material)*/

	//var leaves_geometry = LEAF_GEO//new THREE.BufferGeometry().fromGeometry(new THREE.ConeGeometry( leavesrad, leavesheight, 3 ));
	var height = 0.2
	var leaves = LEAVES_MESH.clone()//new THREE.Mesh( leaves_geometry, leaves_material );

	//trunk.add(leaves)
	//leaves.position.set(0, trunkheight / 2 + leavesheight / 2, 0)

	//var tree = trunk
	var z_offset = 0
	//check for mountain / elevated tiles
	/*if (tile.geometry.parameters.depth != undefined){
		z_offset = tile.geometry.parameters.depth / 2
	}*/

	//leaves.position.set(i + xoff, j + yoff, (ground_z + height/2 + tileheight) )
	leaves.position.set(xoff, yoff, tileheight / 2 + height / 2)
	leaves.rotation.set(Math.PI/2, 0, 0)
	leaves.tree = true
	tile = getTileAt(i, j)
	tile.add(leaves)
	//scene.add(leaves)
}

function getTileAt(x, y){
	//return scene.getObjectByName("tile_" + coords[0] + "_" + coords[1]) 
	return grid_dict["tile_" + x + "_" + y]
}

function checkValidTile(coords){
	if ((Math.abs(coords[0]) <= 2 * WORLD_RAD) && (Math.abs(coords[1]) <= 2 * WORLD_RAD) && (coords[0] >= 0) && (coords[1] >= 0)){
		return true
	}
	else{
		return false
	}
}

function isWater(type){
	if (type == WATER_BODY_TILE_CODE || type == WATER_BODY_START_TILE_CODE || type == RIVER_TILE_CODE || type == RIVER_START_TILE_CODE){
		return true
	}
	return false
}

function isForest(type){
	if (type == FOREST_TILE_CODE || type == FOREST_START_TILE_CODE){
		return true
	}
	return false
}

//removed utils here

function getTileFarmFood(x, y){
	var tile = getTileAt(x, y)
	var grid = tile.tile_grid
	var food = 0
	if (grid == undefined){
		return 0
	}
	else{
		for (var subtile of Object.keys(grid)){
			if (grid[subtile].building == "FA"){
				food += 0.04 * tile.basefood
			}
		}
	}

	return food
}

function growTile(x, y, cityidx, center = false){
	//we can only grow population... if there is population to grow in the first place
	if (!isTileCity(x, y)){
		return
	}

	if (getTileAt(x, y).basefood == undefined){
		assignTileFood(x, y)
	}

	var thistile = getTileAt(x, y)

	thistile.farmfood = getTileFarmFood(x, y)

/*	if (thistile.tile_grid == undefined){

	}
	else{
		for (var subtile of Object.keys(thistile.tile_grid)){
			if (thistile.tile_grid[subtile].building == "FA"){
				thistile.farmfood += 0.03 * thistile.basefood
			}
		}
	}*/

	thistile.availfood = thistile.farmfood

	if (center){
		thistile.availfood += thistile.basefood - cities[cityidx].center.population
	}
	else{
		thistile.availfood += thistile.basefood - cities[cityidx].tiles[x + "_" + y].population
	}

	var poptoadd = getNextPopGrowth(thistile.availfood)

	if (center){
		cities[cityidx].center.population += poptoadd
	}
	else{
		cities[cityidx].tiles[x + "_" + y].population += poptoadd
	}
}

