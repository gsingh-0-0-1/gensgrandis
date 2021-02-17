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

function isCityCenter(cityID, x, y){
	if (cities[cityID].center.x == x && cities[cityID].center.y == y){
		return true
	}
	return false
}

function assignCity(x, y, id){
	grid_dict["tile_" + x + "_" + y].hasCity = true
	grid_dict["tile_" + x + "_" + y].tileCityID = id
}

function isTileCity(x, y){
	if (grid_dict["tile_" + x + "_" + y].hasCity == true){
		return true
	}
	return false
}

function tileHasUnit(x, y){
	if (grid_dict["tile_" + x + "_" + y].hasUnit == true){
		return true
	}
	return false
}

function assignTileUnitStatus(x, y, stat){
	grid_dict["tile_" + x + "_" + y].hasUnit = stat
}

function assignTileFood(x, y){

	if (getTileAt(x, y).basefood != undefined){
		return
	}

	var base = 400

	if (isTileAdjacentToWater(x, y) && !isForest(getTileAt(x, y).type)){
		base = 650
	}

	if (isForest(getTileAt(x, y).type)){
		base = 150
	}

	if (isTileAdjacentToWater(x, y) && isForest(getTileAt(x, y).type)){
		base = 300
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


function showCitySidebar(this_city_ID, tilex, tiley){
	tilex = Math.round(tilex)
	tiley = Math.round(tiley)

	viewing_city_sidebar = true
	selectedcityid = this_city_ID
	selectedcitytilex = tilex
	selectedcitytiley = tiley
	var sidebar = document.getElementById("city_info_sidebar")
	sidebar.style.display = "initial"
	sidebar.style.zIndex = 2

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

	document.getElementById("city_info_sidebar_name").innerHTML = cities[this_city_ID].name

	document.getElementById("city_info_sidebar_center_loc_x").innerHTML = "X: " + centerx
	document.getElementById("city_info_sidebar_center_loc_y").innerHTML = "Y: " + centery

	document.getElementById("city_info_sidebar_selected_loc_x").innerHTML = "X: " + tilex
	document.getElementById("city_info_sidebar_selected_loc_y").innerHTML = "Y: " + tiley

	document.getElementById("city_info_sidebar_selected_food").innerHTML = "Tile Food: " + getTileAt(selectedcitytilex, selectedcitytiley).basefood

	document.getElementById("city_info_sidebar_selected_pop").innerHTML = "Population: "
	if (centerx == tilex && centery == tiley){
		document.getElementById("city_info_sidebar_selected_pop").innerHTML += cities[this_city_ID].center.population
	}
	else{
		document.getElementById("city_info_sidebar_selected_pop").innerHTML += cities[this_city_ID].tiles[tilex + "_" + tiley].population
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

	//document.getElementById("city_info_sidebar_name").innerHTML = ''
}

function handleCityNameInput(event){
	if (event.keyCode == enterkeycode){
		let name = document.getElementById("city_name_input_box").value
		name = name.replaceAll('"', '').replaceAll("'", '').replaceAll(" ", '');

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
		//current_city.center.mesh.cityID = cities.length
		cities.push(current_city)
		naming_city = false
		hideCityNamePanel()
	}
	/*else{
		let val = document.getElementById("city_name_input_box").value
		if (val.length > 20){
			document.getElementById("city_name_input_box").value = val.slice(0, -1)
		}
	}*/
}

function showCityNamePanel(){
	document.getElementById("city_name_input_container").style.display = "initial"
	document.getElementById("city_name_input_container").style.zIndex = "2"
	document.getElementById("city_name_input_box").value = ''		
}

function hideCityNamePanel(){
	document.getElementById("city_name_input_container").style.display = "none"
	document.getElementById("city_name_input_container").style.zIndex = "0"
	document.getElementById("city_name_input_box").value = ''
}

function updateCityLabels(){
	for (var city_iter = 0; city_iter < cities.length; city_iter++){
		var city = cities[city_iter]
		var pos = new THREE.Vector3() 
		pos.x = city.center.mesh.position.x + 0.4
		pos.y = city.center.mesh.position.y - 0.4
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

			d.style.width = city.name.length * 10 + "px"

			d.style.position = "fixed"
			d.style.zIndex = 1

			d.innerHTML = city.name
		}

		pos.project( camera );
		pos.x = Math.round(( pos.x + 1) * width / 2);
		pos.y = Math.round(- ( pos.y - 1) * height / 2);

		d.style.left = pos.x + "px"
		d.style.top = pos.y + "px"
		//console.log(pos)
	}
}




