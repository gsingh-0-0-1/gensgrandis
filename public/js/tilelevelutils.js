/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

//LOAD TEXTURES

var in_tile_level_interface = false




var building_urls = {"cityhall" : "url('/resources/building_icons/cityhall.png')",
					"townhall" : "url('/resources/building_icons/townhall.png')",
					"AM" : "url('/resources/building_icons/AM.png')",
					"FA" : "url('/resources/building_icons/FA.png')",
					"FO" : "url('/resources/building_icons/FO.png')",
					"BA" : "url('/resources/building_icons/BA.png')",
					"X"  : "url('/resources/building_icons/X.png')"}


var SUBTILE_LIST = ["A1",
					"A2",
					"A3",
					"A4",
					"A5",

					"B1",
					"B2",
					"B3",
					"B4",
					"B5",

					"C1",
					"C2",
					"C3",
					"C4",
					"C5",

					"D1",
					"D2",
					"D3",
					"D4",
					"D5",

					"E1",
					"E2",
					"E3",
					"E4",
					"E5",
]

var subtile_building_offsets = {
	"A1" : [-0.4, -0.4],
	"A2" : [-0.2, -0.4],
	"A3" : [0,    -0.4],
	"A4" : [0.2,  -0.4],
	"A5" : [0.4,  -0.4],

	"B1" : [-0.4, -0.2],
	"B2" : [-0.2, -0.2],
	"B3" : [0,    -0.2],
	"B4" : [0.2,  -0.2],
	"B5" : [0.4,  -0.2],

	"C1" : [-0.4, 0],
	"C2" : [-0.2, 0],
	"C3" : [0,    0],
	"C4" : [0.2,  0],
	"C5" : [0.4,  0],

	"D1" : [-0.4, 0.2],
	"D2" : [-0.2, 0.2],
	"D3" : [0,    0.2],
	"D4" : [0.2,  0.2],
	"D5" : [0.4,  0.2],

	"E1" : [-0.4, 0.4],
	"E2" : [-0.2, 0.4],
	"E3" : [0,    0.4],
	"E4" : [0.2,  0.4],
	"E5" : [0.4,  0.4],
}


var subtile_building_mesh_array = {
	"A1" : null,
	"A2" : null,
	"A3" : null,
	"A4" : null,
	"A5" : null,

	"B1" : null,
	"B2" : null,
	"B3" : null,
	"B4" : null,
	"B5" : null,

	"C1" : null,
	"C2" : null,
	"C3" : null,
	"C4" : null,
	"C5" : null,

	"D1" : null,
	"D2" : null,
	"D3" : null,
	"D4" : null,
	"D5" : null,

	"E1" : null,
	"E2" : null,
	"E3" : null,
	"E4" : null,
	"E5" : null,
}

var subtile_unlocks = {
	0 : [],
	100 : ["C2", "B3", "D3", "C4"],
	200 : ["B2", "B4", "D2", "D4"],
	300 : ["C1", "A3", "E3", "C5"],
	400 : ["B1", "D1", "A2", "A4", "E2", "E4", "B5", "D5"],
	500 : ["A1", "A5", "E1", "E5"]
}

function checkUnlockedSubTile(population, subtile){
	var modpop = Math.floor(population / 100)
	modpop *= 100

	var unlocks = subtile_unlocks[modpop]

	if (modpop <= 0){
		return false
	}
	if (unlocks == undefined){
		return true
	}
	if (unlocks.includes(subtile)){
		return true
	}
	else{
		return checkUnlockedSubTile(modpop - 100, subtile)
	}
}

function createTileGrid(x, y, center = false){
	var grid = new Object()

	grid.A1 = new Object()
	grid.A2 = new Object()
	grid.A3 = new Object()
	grid.A4 = new Object()
	grid.A5 = new Object()


	grid.B1 = new Object()
	grid.B2 = new Object()
	grid.B3 = new Object()
	grid.B4 = new Object()
	grid.B5 = new Object()


	grid.C1 = new Object()
	grid.C2 = new Object()
	grid.C3 = new Object()
	if (center){
		grid.C3.building = "cityhall"
	}
	else{
		grid.C3.building = "townhall"
	}
	grid.C4 = new Object()
	grid.C5 = new Object()


	grid.D1 = new Object()
	grid.D2 = new Object()
	grid.D3 = new Object()
	grid.D4 = new Object()
	grid.D5 = new Object()


	grid.E1 = new Object()
	grid.E2 = new Object()
	grid.E3 = new Object()
	grid.E4 = new Object()
	grid.E5 = new Object()

	getTileAt(x, y).tile_grid = grid
}


function showTileLevelInterface(){

	//pauseOrPlayGame()

	pauseGame()

	if (isCityCenter(selectedcityid, selectedcitytilex, selectedcitytiley)){
		var population = cities[selectedcityid].center.population
		renderBuildingInSubtileView(CITY_HALL_TEXTURE, "C3")
	}
	else{
		var population = cities[selectedcityid].tiles[selectedcitytilex + "_" + selectedcitytiley].population
		renderBuildingInSubtileView(TOWN_HALL_TEXTURE, "C3")
	}

	var unlockedtiles = subtile_unlocks[Math.floor(population / 100) * 100]

	in_tile_level_interface = true

	for (var subtile of SUBTILE_LIST){
		if (subtile == "C3"){
			continue
		}
		tile_level_scene.remove(subtile_building_mesh_array[subtile])
		subtile_building_mesh_array[subtile] = null
	}


	for (var tile of tile_level_interface_tile_list){
		let unlocked = checkUnlockedSubTile(population, tile.subtileName)

		if (unlocked){
			tile.unlocked = true
		}
		if (unlocked || tile.subtileName == "C3"){
			tile.material.color = new THREE.Color(getTileAt(selectedcitytilex, selectedcitytiley).material.color)
		}
		else{
			tile.unlocked = false
			tile.material.color = new THREE.Color(0x444444)
		}
	}


	/*var tbody = document.getElementById("tile_level_table").children[0]

	var col = getTileAt(selectedcitytilex, selectedcitytiley).material.color
	var r = Math.round(col.r * 255)
	var g = Math.round(col.g * 255)
	var b = Math.round(col.b * 255)

	tbody.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")"*/

	unSelectSubtile()

	if (getTileAt(selectedcitytilex, selectedcitytiley).tile_grid == undefined){
		if (isCityCenter(selectedcityid, selectedcitytilex, selectedcitytiley)){
			createTileGrid(selectedcitytilex, selectedcitytiley, true)
		}
		else{
			createTileGrid(selectedcitytilex, selectedcitytiley)
		}
	}

	var maintile = getTileAt(selectedcitytilex, selectedcitytiley)

	var grid = maintile.tile_grid

	for (var subtile of Object.keys(grid)){
		if (grid[subtile].building == undefined){
			continue
		}
		renderBuildingInSubtileView(CODE_TEXTURE_DICT[grid[subtile].building], subtile)
	}

	document.getElementById("tile_level_interface").style.display = "initial"
	document.getElementById("tile_level_interface").style.zIndex = "4"


	/*for (var subtile of Object.keys(grid)){
		if (grid[subtile].building == undefined){
			grid[subtile].building = "X"
		}
		var bgdiv = document.getElementById("subtile_" + subtile).children[0]
		bgdiv.style.backgroundImage = building_urls[grid[subtile].building]
		bgdiv.name = grid[subtile].building

		if (subtile == "C3"){
			continue // skip the center tile
		}

		var sel = document.getElementById("subtile_" + subtile).children[1]
		if (unlockedtiles == undefined){
			sel.style.display = "initial"
		}
		else{
			var unlocked = checkUnlockedSubTile(population, subtile)
			if (unlocked){
				sel.style.display = "initial"
			}
			else{
				sel.style.display = "none"
			}
		}
	}*/
}

function hideTileLevelInterface(){
	playGame()
	in_tile_level_interface = false
	document.getElementById("tile_level_interface").style.display = "none"
	document.getElementById("tile_level_interface").style.zIndex = "0"
}

function selectSubTileOption(obj){
	var subtile_id = obj.parentNode.parentNode.id.split("_")[1]
	document.getElementById("subtile_" + subtile_id).children[0].style.backgroundImage = building_urls[obj.name]
	document.getElementById("subtile_" + subtile_id).children[0].name = obj.name
	/*if (obj.name == "X"){
		getTileAt(selectedcitytilex, selectedcitytiley).tile_grid[subtile_id] = null
	}
	else{
		getTileAt(selectedcitytilex, selectedcitytiley).tile_grid[subtile_id] = obj.name
	}*/
}


function applyTileGridChanges(){
	var tile = getTileAt(selectedcitytilex, selectedcitytiley)

	var grid = tile.tile_grid

	var farms = 0

	for (var subtile of Object.keys(grid)){
		//do not change center
		if (subtile == "C3"){
			continue
		}
		else{
			if (subtile_building_mesh_array[subtile] == null || subtile_building_mesh_array[subtile] == undefined){
				var current_selected = null
			}
			else{
				var current_selected = subtile_building_mesh_array[subtile].texturename //document.getElementById("subtile_" + subtile).children[0].name
			}
		}

		//skip if the building is the same
		if (current_selected == grid[subtile].building){
			continue
		}

		//check if building has been removed
		if ((grid[subtile].building != null && grid[subtile].building != undefined) && (current_selected == null || current_selected == undefined)){
			removeBuilding(subtile)
			socket.emit('addbuilding', subtile, "X", selectedcitytilex, selectedcitytiley, selectedcityid)
			continue
		}

		grid[subtile].building = current_selected

		renderBuilding(current_selected, subtile)

		//subtile_building_mesh_array[subtile] = null
	}
}

function renderBuilding(building_code, subtile_code, x = null, y = null, id = null, self = true){
	removeBuilding(subtile_code, x, y, id)
	if (building_code == "FA"){
		addBuilding(subtile_code, FARM_TEXTURE, x, y, id, self)
	}
	if (building_code == "BA"){
		addBuilding(subtile_code, BARRACKS_TEXTURE, x, y, id, self)
	}
	if (building_code == "FO"){
		addBuilding(subtile_code, FORGE_TEXTURE, x, y, id, self)
	}
	if (building_code == "AM"){
		addBuilding(subtile_code, ARMORY_TEXTURE, x, y, id, self)
	}
	if (building_code == "X"){
		removeBuilding(subtile_code, x, y, id)
	}
}

function addBuilding(subtile_code, building_texture, x = null, y = null, id = null, self = true){

	if (x == null || y == null || id == null){
		x = selectedcitytilex
		y = selectedcitytiley
		id = selectedcityid
	}

	var offsets = subtile_building_offsets[subtile_code]

	var texture = THREE.SkeletonUtils.clone(building_texture) //building_texture.clone()

	//texture.city = true
	//texture.cityID = selectedcityid

	texture.position.set(offsets[0], 0, offsets[1])

	var targetmesh = null

	if (isCityCenter(id, x, y)){
		targetmesh = cities[id].center.mesh
	}
	else{
		targetmesh = cities[id].tiles[x + "_" + y].mesh
	}

	targetmesh.add(texture)

	getTileAt(x, y).tile_grid[subtile_code].mesh = texture
	getTileAt(x, y).tile_grid[subtile_code].building = building_texture.texturename

	if (self){
		socket.emit('addbuilding', subtile_code, building_texture.texturename, x, y, id)
	}
}

function removeBuilding(subtile_code, x = null, y = null, id = null){

	if (x == null || y == null || id == null){
		x = selectedcitytilex
		y = selectedcitytiley
		id = selectedcityid
	}

	var targetmesh = null

	if (isCityCenter(id, x, y)){
		targetmesh = cities[id].center.mesh
	}
	else{
		targetmesh = cities[id].tiles[x + "_" + y].mesh
	}

	targetmesh.remove(getTileAt(x, y).tile_grid[subtile_code].mesh)

	getTileAt(x, y).tile_grid[subtile_code].mesh = null
	getTileAt(x, y).tile_grid[subtile_code].building = ""
}


/*
//add selectors to each subtile grid cell
var sel = document.createElement('div')
sel.style.position = "absolute"
sel.style.left = "0%"
sel.style.top = "0%"
sel.style.width = "100%"
sel.style.height = "20%"
sel.style.overflow = "auto"
sel.style.backgroundColor = "#666"
//sel.style.transform = "translate(0%, 50%)"
sel.style.whiteSpace = "nowrap"

var farmbutton = document.createElement('button')
farmbutton.className = "button"
//farmbutton.style.backgroundColor = "#77b977"
farmbutton.style.backgroundImage = "url('/resources/building_icons/FA.png')"
farmbutton.style.backgroundSize = "100%"
farmbutton.style.padding = "0px 0px"
farmbutton.style.position = "relative"
farmbutton.style.height = "80%"
farmbutton.style.width = "16%"
farmbutton.name = "FA"

sel.appendChild(farmbutton)

var armorybutton = farmbutton.cloneNode(true)
armorybutton.name = "AM"
//armorybutton.style.backgroundColor = "#444"
armorybutton.style.backgroundImage = "url('/resources/building_icons/AM.png')"

sel.appendChild(armorybutton)

var forgebutton = farmbutton.cloneNode(true)
forgebutton.name = "FO"
//forgebutton.style.backgroundColor = "#b55"
forgebutton.style.backgroundImage = "url('/resources/building_icons/FO.png')"

sel.appendChild(forgebutton)

var barracksbutton = farmbutton.cloneNode(true)
barracksbutton.name = "BA"
//barracksbutton.style.backgroundColor = "#57b"
barracksbutton.style.backgroundImage = "url('/resources/building_icons/BA.png')"

sel.appendChild(barracksbutton)

var nullbutton = farmbutton.cloneNode(true)
nullbutton.name = "X"
//nullbutton.style.backgroundColor = "#000"
nullbutton.style.backgroundImage = "url('/resources/building_icons/X.png')"

sel.appendChild(nullbutton)


//create main bg image div
var bgimgdiv = document.createElement('div')
bgimgdiv.style.position = "absolute"
bgimgdiv.style.left = "50%"
bgimgdiv.style.top = "50%"
bgimgdiv.style.width = "50%"
bgimgdiv.style.height = "50%"
bgimgdiv.style.transform = "translate(-50%, -50%)"
bgimgdiv.style.backgroundSize = "100%"


var letters = ["A", "B", "C", "D", "E"]
var nums = 5

for (var letter of letters){
	for (var num = 1; num <= nums; num++){
		var subtile = document.getElementById("subtile_" + letter + num)
		subtile.appendChild(bgimgdiv.cloneNode(true))
		//not for the center tile
		if (letter == "C" && num == 3){
			continue
		}

		//.cloneNode() doesn't copy event listeners, so I have to do it here:
		var this_sel = sel.cloneNode(true)
		for (child of this_sel.children){
			child.onclick = function(){
				selectSubTileOption(this);
				return false;
			}
		}
		
		subtile.appendChild(this_sel)
	}
}

*/

function subtileMouseClick(event){
	var mouse = new THREE.Vector2()
	var raycaster = new THREE.Raycaster();
	var rect = tile_level_renderer.domElement.getBoundingClientRect();
	mouse.x = ( (event.clientX - rect.left) / window.innerHeight ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, tile_level_camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( tile_level_scene.children, true );

	for (var intersect of intersects){
		if (intersect.object.subtileName != undefined && intersect.object.unlocked == true){
			selectSubtile(intersect.object)
		}
	}

}

function selectSubtile(obj){
	selectedsubtile = obj.subtileName
	subtileoutline.position.x = obj.position.x//-subtile_building_offsets[selectedsubtile][0] * 5
	subtileoutline.position.y = obj.position.y//-subtile_building_offsets[selectedsubtile][1] * 5
	subtileoutline.visible = true
}

function unSelectSubtile(){
	selectedsubtile = null
	subtileoutline.visible = false
}

function renderBuildingInSubtileView(b_texture, subtile_code = ''){

	if (b_texture == null || b_texture == undefined){
		return
	}

	if (subtile_code == ''){
		if (selectedsubtile == null || selectedsubtile == undefined){
			return
		}
		subtile_code = selectedsubtile
	}

	removeBuildingInSubtileView(subtile_code)

	var texture = b_texture.clone()
	texture.texturename = b_texture.texturename

	//texture.rotation.set(Math.PI / 2, 0, 0)

	texture.scale.set(5, 5, 5)

	texture.position.x = subtile_building_offsets[subtile_code][0] * 5
	texture.position.y = -subtile_building_offsets[subtile_code][1] * 5

	texture.rotation.set(Math.PI / 2, 0, 0)

	tile_level_scene.add(texture)

	subtile_building_mesh_array[subtile_code] = texture
}

function removeBuildingInSubtileView(subtile_code = ''){
	if (subtile_code == ''){
		subtile_code = selectedsubtile
	}

	if (subtile_building_mesh_array[subtile_code] != null){
		tile_level_scene.remove(subtile_building_mesh_array[subtile_code])
		subtile_building_mesh_array[subtile_code] = null
	}

}

var tile_level_scene = new THREE.Scene({canvas : tile_level_canvas})
tile_level_scene.background = new THREE.Color(0xddddcc)

var tile_level_camera = new THREE.PerspectiveCamera( 45, 1, 1, 15 );
var tile_level_renderer = new THREE.WebGLRenderer({antialias: true});

tile_level_camera.lookAt(0, 0, 0)
tile_level_camera.position.set(0, 0, 10)

tile_level_camera.lookAt(0, 10, 0)
tile_level_camera.position.set(0, -6, 6)

var geometry = new THREE.TorusGeometry( 0.5 * Math.sqrt(2, 1/2), 0.02, 8, 4 );
var material = new THREE.MeshBasicMaterial( { color: 0xaa0000 } );
var subtileoutline = new THREE.Mesh( geometry, material );
subtileoutline.rotation.set(0, 0, Math.PI / 4)
subtileoutline.visible = false
tile_level_scene.add( subtileoutline );


var subtile_light = new THREE.DirectionalLight( 0xffffff, 1.5 );
subtile_light.position.set(0, -6, 6)
subtile_light.target.position.set(0, 10, 0)
tile_level_scene.add(subtile_light);
tile_level_scene.add(subtile_light.target)

var subtile_buildings_change_buffer = [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]]

var selectedsubtile = null


tile_level_renderer.setSize(window.innerHeight, window.innerHeight);
document.getElementById('tile_level_canvas').appendChild(tile_level_renderer.domElement);

document.getElementById('tile_level_canvas').addEventListener('click', subtileMouseClick)

var geometry = new THREE.PlaneGeometry(1, 1)
var edges = new THREE.EdgesGeometry(geometry)
var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );


tile_level_interface_tile_list = []

for (var y = -2; y <= 2; y++){
	for (var x = -2; x <= 2; x++){
		var subtile_index = ((x + 2) + ((-y + 2) * 5))

		var tilematerial = new THREE.MeshBasicMaterial( {color: 0x228822} )
		var mesh = new THREE.Mesh(geometry, tilematerial)
		mesh.subtileName = SUBTILE_LIST[subtile_index]

		mesh.position.set(x, y, 0)
		tile_level_scene.add(mesh)

		tile_level_interface_tile_list.push(mesh)

		line.position.set(x, y, 0)
		tile_level_scene.add(line.clone())

	}
}