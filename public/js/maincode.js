var socket = io(window.location.pathname);

var chatinput = document.getElementById("chatinput")

var params = window.location.search
params = params.replace("?", '')
params = params.split("&")

var username = "user" + Math.ceil(Math.random() * 10000)

for (var param of params){
	if (param.includes("username")){
		let uinfo = param.split("=")
		if (uinfo[1] == undefined){
		}
		else{
			username = uinfo[1]
		}
	}
}

function sendChatMessage(msg){
	socket.emit('chatmessage', username, msg)
}

function addChatMessage(username, msg, self = false){
	var item = document.createElement('li');
	item.textContent = username
	if (self){
		item.textContent += " (You) "
	}
	item.textContent += ": " + msg;
	messages.appendChild(item);
	document.getElementById("chatbox").scrollTo(0, document.getElementById("chatbox").scrollHeight);	
}

document.getElementById("chatform").addEventListener('submit', function(e) {
	e.preventDefault();
	if (chatinput.value) {
		sendChatMessage(chatinput.value)
		addChatMessage(username, chatinput.value, true)
		chatinput.value = '';
	}
});

socket.on('chatmessage', function(user, msg) {
	addChatMessage(user, msg)
});

var cont = document.getElementById("music_holder")

addSong("gg_1", "Beginnings", cont)
addSong("gg_2", "Sailing", cont)
//addSong("gg_3", "March of the Legion", cont)
addSong("gg_4", "Exploring", cont)
addSong("gg_5", "Gens Grandis", cont)
addSong("gg_6", "Sly", cont)

var multi = false

if (window.location.pathname.includes("room")){
	multi = true
}

if (!multi){
	showTutorialAsk()
}

//****************************************************************************************//
//******************************CONSTANTS AND INITIALIZATION******************************//
//****************************************************************************************//
const leftarrowcode = 37
const uparrowcode = 38
const rightarrowcode = 39
const downarrowcode = 40
const spacekeycode = 32
const shiftkeycode = 16
const akeycode = 65
const dkeycode = 68
const esckeycode = 27
const endturnkeycode = 84
const enterkeycode = 13

var unit_types = ["reg", "mil"]

var unit_corresponds = {"P" : "People", 
						"RB" : "Riverboat",
						"L" : "Legion"}

var unit_movements = {"P" : 5, 
						"RB" : 10, 
						"L" : 3}

var unit_commands = {"P" : "B: Build city",
					"RB" : "",
					"L" : ""}

var unit_produce_times = {"RB" : 500,
							"L" : 250}

var unit_z_offsets = {"P" : 0.7,
					"RB" : 0,
					"L" : 0.7}

//unit templates
var people_template = "P~x:xhere,y:yhere,n:100,m:" + unit_movements["P"]
var riverboat_template = "RB~x:xhere,y:yhere,m:" + unit_movements["RB"]
var legion_template = "L~x:xhere,y:yhere,m:" + unit_movements["L"]

var moving_unit = false;
var expanding_city = false;

var unit_z_offset = 0.7

var mincitytilepop = 50

var city_tile_hut_locs = [[0, 0], 
							[0.2, 0.1], 
							[0, 0.1], 
							[-0.1, 0.15], 
							[-0.1, -0.1], 
							[0.1, 0],
							[-0.2, 0.1],
							[0.1, -0.1],
							[0.2, -0.22],
							[0.3, -0.2]]
var MAX_CITY_TILE_SIZE = 6
var TILE_POP_STEP = 100

var urlParams = new URLSearchParams(window.location.search);
const GAMEID = urlParams.get("gameid")
/*var ACCESSCODE = urlParams.get("accesscode")
var ACSTRING = "accesscode=" + ACCESSCODE*/

const LAND_TILE_CODE = 'l'

const FOREST_START_TILE_CODE = 's,l,f'
const FOREST_TILE_CODE = 'l,f'

const MOUNTAIN_START_TILE_CODE = 's,l,m'
const MOUNTAIN_TILE_CODE = 'l,m'

const WATER_BODY_START_TILE_CODE = 's,w,l,n'
const WATER_BODY_TILE_CODE = 'w,l,n'

const RIVER_START_TILE_CODE = 's,w,l,r'
const RIVER_TILE_CODE = 'w,r'

const DESERT_TILE_CODE = 'l,d'

const HEIGHT_DELIMITER = "#"
const INFO_DELIMITER = "|"

const WORLD_RAD = 500

var WORLD_SEED = 0

var activetiles = []
var exploredtiles = 'null'
var units = []

var LOAD_TERRAIN_DIST = 2

var MOUNTAIN_FOREST_HEIGHT = 1
var MOUNTAIN_STONE_HEIGHT = 5
var MOUNTAIN_SNOWCAP_HEIGHT = 6
var MOUNTAIN_SNOW_HEIGHT = 8.5

var FILE = "map1"

var rad = 0.05
var height = 0.2

var trunkheight = height * 0.2
var trunkrad = rad * 0.5

var leavesheight = height// * 0.8
var leavesrad = rad

const leaves_material = new THREE.MeshBasicMaterial( {color: 0x116611} );
const leaves_geometry = new THREE.BufferGeometry().fromGeometry(new THREE.ConeGeometry( leavesrad, leavesheight, 3 ));
const LEAVES_MESH = new THREE.Mesh( leaves_geometry, leaves_material );

var cameralooking = 'front'

var gamecenterx = 550
var gamecentery = 555

var camerainitx = gamecenterx
var camerainity = gamecentery
var camerainitz = 5

const ground_z = -2
const base_tile_height = 0

var grid_dict = {}

//****************************************************************************************//
//****************************************************************************************//
//****************************************************************************************//

//other game functions
function center(){
	cameravelocity.x = 0
	cameravelocity.y = 0
	camera.position.set(camerainitx, camerainity, camerainitz)
	camera.lookAt(camerainitx, camerainity + 5, camerainitz - 5)
	cameralooking = 'front'
}

//basic initialization
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 45, width / height, 1, 50 );
//camera.rotation.order = 'ZYX'
var renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.physicallyCorrectLights = true
renderer.setSize(width, height);
document.getElementById('gui').appendChild(renderer.domElement);
var gui = document.getElementById('gui')
var scene = new THREE.Scene({canvas:gui});
scene.background = new THREE.Color( 0x000000 );
scene.add(camera);
var cameravelocity = new Object()
cameravelocity.x = 0
cameravelocity.y = 0
cameravelocity.z = 0

var geometry = new THREE.TorusGeometry( 0.5 * Math.sqrt(2, 1/2), 0.02, 8, 4 );
var material = new THREE.MeshBasicMaterial( { color: 0xaa0000 } );
var tileoutline = new THREE.Mesh( geometry, material );
tileoutline.rotation.set(0, 0, Math.PI / 4)
tileoutline.visible = false
scene.add( tileoutline );

var light_z_offset = 4
var directionalLight_fromSouth = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight_fromSouth.position.set(camerainitx, camerainity, ground_z + light_z_offset)
directionalLight_fromSouth.target.position.set(camerainitx, camerainity + 5, ground_z)
scene.add(directionalLight_fromSouth);
scene.add(directionalLight_fromSouth.target)


/*var directionalLight_fromNorth = new THREE.DirectionalLight( 0xffffff, 0.75 );
directionalLight_fromNorth.position.set(camerainitx, camerainity, ground_z + 3)
directionalLight_fromNorth.target.position.set(camerainitx, camerainity - 5, ground_z)
scene.add(directionalLight_fromNorth);
scene.add(directionalLight_fromNorth.target)*/

/*var composer = new THREE.EffectComposer(renderer)
var outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
var renderPass = new THREE.RenderPass(scene, camera);

outlinePass.renderToScreen = true;

outlinePass.edgeStrength = 2;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0xffffff);

composer.addPass(renderPass);
composer.addPass(outlinePass);*/

//scene.fog = new THREE.Fog(0x888888, 0, 100)


function getTileBuildingBoosts(id, x, y, center = false){
	if (getTileAt(x, y).tile_grid == undefined){
		return [0, 0, 0]
	}
	if (center){
		var population = cities[id].center.population
	}
	else{
		var population = cities[id].tiles[x + "_" + y].population
	}
	num_armories = 0
	num_forges = 0
	num_barracks = 0
	for (var subtile of SUBTILE_LIST){
		let building = getTileAt(x, y).tile_grid[subtile].building
		if (building == "AM"){
			num_armories += 1
		}
		if (building == "FO"){
			num_forges += 1
		}
		if (building == "BA"){
			num_barracks += 1
		}
	}

	var armories_boost = num_armories * 0.04 * population
	var forges_boost = num_forges * 0.04 * population
	var barracks_boost = num_barracks * 0.04 * population

	return [Math.round(armories_boost, 1), Math.round(barracks_boost, 1), Math.round(forges_boost, 1)]
}


//TURN BASED EVENTS AND CHANGES
function endTurn(){
	//update unit movements
	for (var unit of unitlist){
		unit.m = unit_movements[unit.type]
	}
	if (selectedunitid != 'null'){
		updateUnitBar(selectedunitid)
	}

	//update city populations
	var numcities = cities.length
	for (var cityidx = 0; cityidx < numcities; cityidx++){

		//cities[cityidx].people_turns += getTotalPop(cityidx)


		/*//DEAL WITH UNIT PRODUCTION
		if (cities[cityidx].people_turns >= unit_produce_times[cities[cityidx].producing]){
			var curprod = cities[cityidx].producing
			var targetx = cities[cityidx].center.x
			var targety = cities[cityidx].center.y

			if (curprod == "RB"){
				addRiverboat(targetx, targety)
			}
			if (curprod == "L"){
				addLegion(targetx, targety)
			}

			cities[cityidx].producing = null
			cities[cityidx].people_turns = 0				
		}*/

		//calculate building numbers
		var buildingBoosts = [0, 0, 0]

		var centerBuildingBoosts = getTileBuildingBoosts(cityidx, cities[cityidx].center.x, cities[cityidx].center.y, true)

		buildingBoosts[0] += centerBuildingBoosts[0]
		buildingBoosts[1] += centerBuildingBoosts[1]
		buildingBoosts[2] += centerBuildingBoosts[2]

		for (var tile of Object.keys(cities[cityidx].tiles)){
			var tileBuildingBoosts = getTileBuildingBoosts(cityidx, cities[cityidx].tiles[tile].x, cities[cityidx].tiles[tile].y, false)

			buildingBoosts[0] += tileBuildingBoosts[0]
			buildingBoosts[1] += tileBuildingBoosts[1]
			buildingBoosts[2] += tileBuildingBoosts[2]				
		}

		var armories_boost = buildingBoosts[0]
		var barracks_boost = buildingBoosts[1]
		var forges_boost = buildingBoosts[2]

		var mil_boost = barracks_boost + (armories_boost / 2) + (forges_boost / 4)
		var reg_boost = (forges_boost * 3 / 4) + (armories_boost / 2)

		if (cities[cityidx].producing["mil"] != null){
			cities[cityidx].production_progress["mil"] += mil_boost
		}
		if (cities[cityidx].producing["reg"] != null){
			cities[cityidx].production_progress["reg"] += reg_boost
		}

		for (var type of unit_types){
			if (cities[cityidx].producing[type] != null || cities[cityidx].producing[type] != undefined){
				if (cities[cityidx].production_progress[type] > unit_produce_times[cities[cityidx].producing[type]]){
					var prod = cities[cityidx].producing[type]
					var targetx = cities[cityidx].center.x
					var targety = cities[cityidx].center.y
					if (prod == "L"){
						addLegion(targetx, targety)
					}
					if (prod == "RB"){
						addRiverboat(targetx, targety)
					}
					cities[cityidx].production_progress[type] -= unit_produce_times[cities[cityidx].producing[type]]

					cities[cityidx].producing[type] = null
				}
			}
		}

		growTile(cities[cityidx].center.x, cities[cityidx].center.y, cityidx, true)

		for (var tile of Object.keys(cities[cityidx].tiles)){
			growTile(cities[cityidx].tiles[tile].x, cities[cityidx].tiles[tile].y, cityidx)
		}
	}

	if (viewing_city_sidebar){
		showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)
	}

	socket.emit('turndone')

	if (multi){
		waitForTurn()
	}
}

function checkAndLoad(x, y, explore = true){
	//check the appropriate tiles for being loaded or not
	var tiles_to_check = [
	[x, y],
	[x + LOAD_TERRAIN_DIST, y],
	[x - LOAD_TERRAIN_DIST, y],
	[x, y + LOAD_TERRAIN_DIST],
	[x, y - LOAD_TERRAIN_DIST],
	[x + LOAD_TERRAIN_DIST, y + LOAD_TERRAIN_DIST],
	[x + LOAD_TERRAIN_DIST, y - LOAD_TERRAIN_DIST],
	[x - LOAD_TERRAIN_DIST, y - LOAD_TERRAIN_DIST],
	[x - LOAD_TERRAIN_DIST, y + LOAD_TERRAIN_DIST]
	]
	for (var tile of tiles_to_check){
		var tx = tile[0]
		var ty = tile[1]
		if (getTileAt(tx, ty) == undefined && checkValidTile([tx, ty])){
			//render the correct areas
			fetchAndRender([tx - LOAD_TERRAIN_DIST, ty - LOAD_TERRAIN_DIST], [tx + LOAD_TERRAIN_DIST, ty + LOAD_TERRAIN_DIST])
		}
	}
	// "explore" at the correct areas
	if (explore){
		exploreAtCoords(x, y)
	}
}


//STUFF TO CONTROL UNITS 

var selectedunitid = 'null'
var selectedcolorfactor = 1.2
//onMouseClick()

function exploreAtCoords(x, y){
	x = x * 1
	y = y * 1
	for (var expl_x = -1; expl_x <= 1; expl_x++){
		for (var expl_y = -1; expl_y <= 1; expl_y++){
			newx = x + expl_x
			newy = y + expl_y
			if (checkValidTile([newx, newy]) && !exploredtiles.includes(newx + "," + newy)){

				exploredtiles.push(newx + "," + newy)
				getTileAt(newx, newy).visible = true
			}
		}
	}
}

function showTurnWaitScreen(){
	document.getElementById("turnwaitscreen").style.display = "initial"
}

function hideTurnWaitScreen(){
	document.getElementById("turnwaitscreen").style.display = "none"
}

function waitForTurn(){
	document.getElementById("turnwaitscreen").style.display = "initial"
}

function hideLoadingScreen(){
	document.getElementById("gameloadingscreen").style.display = "none"
}

function activateTilesAtCenter(x, y){
	x = x * 1
	y = y * 1
	for (var xoff = -1; xoff <= 1; xoff++){
		for (var yoff = -1; yoff <= 1; yoff++){
			var tile = (x + xoff) + "," + (y + yoff)
			if (!activetiles.includes(tile)){
				activetiles.push(tile)
			}
		}
	}
}

function deActivateTilesAtCenter(x, y){
	x = x * 1
	y = y * 1
	for (var xoff = -1; xoff <= 1; xoff++){
		for (var yoff = -1; yoff <= 1; yoff++){
			if (isTileAdjacentToSelfCity(x + xoff, y + yoff)){
				continue
			}
			activetiles.splice(activetiles.indexOf((x + xoff) + "," + (y + yoff)), 1)
		}
	}
}


//CITY STUFF

var viewing_city_sidebar = false
var selectedcityid = 'null'
var selectedcitytilex = 'null'
var selectedcitytiley = 'null'
//var tileoutline = 'null'

var in_city_tile_view = false
var redirecting_food = false

function reAssignFood(coords1, coords2, amount){
	console.log(coords1, coords2, amount)
	getTileAt(coords1[0], coords1[1]).basefood -= amount
	getTileAt(coords2[0], coords2[1]).basefood += amount
	if (viewing_city_sidebar){
		if ((selectedcitytilex == coords1[0] && selectedcitytiley == coords1[1]) || (selectedcitytilex == coords2[0] && selectedcitytiley == coords2[1])){
			showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)
		}
	}
}

function redirectFood(tileobj = '', citycenter = false, x = '', y = ''){
	if (!in_city_tile_view && !citycenter){
		showCityTileView()
	}
	if (!redirecting_food && !citycenter){
		redirecting_food = true
		return
	}
	else{
		if (tileobj == '' && !citycenter){
			return
		}
		else{
			if (!citycenter){
				var split = tileobj.id.split("_")
				var targetx = split[2] * 1
				var targety = split[3] * 1
			}
			else{
				var targetx = x * 1
				var targety = y * 1
			}
			assignTileFood(selectedcitytilex, selectedcitytiley)
			assignTileFood(targetx, targety)

				
			if (!citycenter){
				var redirectval = document.getElementById("foodRedirectTextInput").value
				document.getElementById("foodRedirectTextInput").value = ''
			}
			else{
				var redirectval = document.getElementById("citycentertrading_input").value
				document.getElementById("citycentertrading_input").value = ''
			}

			if (isNaN(redirectval)){
				return
			}

			redirectval = redirectval * 1

			if (redirectval < 1){
				return
			}

			if (getTileAt(selectedcitytilex, selectedcitytiley).basefood - redirectval < mincitytilepop){
				alert("Too much food to redirect! You need to leave 50 food on each tile.")
				return
			}

			//getTileAt(selectedcitytilex, selectedcitytiley).basefood -= redirectval
			//getTileAt(targetx, targety).basefood += redirectval
			reAssignFood([selectedcitytilex, selectedcitytiley], [targetx, targety], redirectval)
			redirecting_food = false

			//showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)

			socket.emit('redirectfood', selectedcitytilex, selectedcitytiley, targetx, targety, redirectval)
		}
	}
}

function showCityTileView(argCityID = selectedcityid){
	in_city_tile_view = true
	var tilescreen = document.getElementById("city_tile_view_screen")
	tilescreen.textContent = ''
	tilescreen.style.zIndex = "2"
	tilescreen.style.display = "initial"

	var this_city = cities[argCityID]
	var this_city_x = this_city.center.x
	var this_city_y = this_city.center.y

	var windowheight = tilescreen.clientHeight
	var windowwidth = tilescreen.clientWidth

	//render the city center
	var tiles = Object.keys(this_city.tiles)
	var centertile = this_city_x + "_" + this_city_y
	tiles.push(centertile)

	for (var citytile of tiles){
		var tile = document.getElementById("tiletemplate")
		var tile_clone = tile.cloneNode(true)
		if (citytile == centertile){
			var x = 0
			var y = 0
		}
		else{
			var x = this_city.tiles[citytile].x - this_city_x
			var y = this_city.tiles[citytile].y - this_city_y
		}

		tile_clone.id = this_city.cityID + "_" + this_city.name + "_" + (x + this_city_x) + "_" + (y + this_city_y)

		y = -y
		tile_clone.style.position = "fixed"
		tile_clone.style.zIndex = 2
		tile_clone.style.top = (y*100 + Math.round(windowheight / 2)) + "px"
		tile_clone.style.left = (x*100 + Math.round(windowwidth / 2)) + "px"
		tile_clone.style.border = "1px solid white"

		//get the color of the tile
		if (x == 0 && y == 0){
			tile_clone.style.backgroundColor = "rgb(140, 20, 20)"
		}
		else{
			var col = getTileAt(this_city.tiles[citytile].x, this_city.tiles[citytile].y).material.color
			var r = Math.round(col.r * 255)
			var g = Math.round(col.g * 255)
			var b = Math.round(col.b * 255)

			tile_clone.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")"
		}

		document.getElementById("city_tile_view_screen").appendChild(tile_clone)
	}
}

function selectTileFromTileView(obj){
	if (redirecting_food){
		redirectFood(obj)
		return
	}
	//alert("here")
	var split = obj.id.split("_")
	var x = split[2] * 1
	var y = split[3] * 1
	var id = split[0] * 1
	showCitySidebar(id, x, y)
}

function hideCityTileView(){
	in_city_tile_view = false
	document.getElementById("city_tile_view_screen").style.zIndex = "0"
	document.getElementById("city_tile_view_screen").style.display = "none"
}


function breakCity(){
	var targetpop = 100
	//check if there is enough population to break off into people

	if (tileHasUnit(selectedcitytilex, selectedcitytiley)){
		return
	}

	//first check if we are at the city center
	if (isCityCenter(selectedcityid, selectedcitytilex, selectedcitytiley)){
		var population = cities[selectedcityid].center.population
		if (population - targetpop < mincitytilepop){
			alert("Not enough population!")
			return
		}
		cities[selectedcityid].center.population -= targetpop
	}
	else{
		var population = cities[selectedcityid].tiles[selectedcitytilex + "_" + selectedcitytiley].population
		if (population - targetpop < mincitytilepop){
			alert("Not enough population!")
			return
		}
		cities[selectedcityid].tiles[selectedcitytilex + "_" + selectedcitytiley].population -= targetpop
	}

	showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)
	addPeople(selectedcitytilex, selectedcitytiley)
}


function expandCity(dir, argx='', argy='', argid='', self = true){
	var x = argx
	var y = argy
	var id = argid

	if (isNaN(argx) || isNaN(argy) || isNaN(argid) || argx === '' || argy === '' || argid === ''){
		var x = selectedcitytilex
		var y = selectedcitytiley
		var id = selectedcityid
	}

	var targetx = x + (1*dir[0])
	var targety = y + (1*dir[1])
	var targetpop = 50

	//ensure that tile is valid
	if (!checkValidTile([targetx, targety])){
		return
	}

	//if self, tile must be explored
	if (!exploredtiles.includes(targetx + "," + targety) && self){
		return
	}

	//ensure that the tile is not water
	if (isWater(grid_dict["tile_" + targetx + "_" + targety].type)){
		return
	}

	//ensure that the tile is not too high up
	if (getTileAt(targetx, targety).height > MOUNTAIN_STONE_HEIGHT){
		return
	}

	//check if tile is already in current city
	//(cities[selectedcityid].center.x == targetx && cities[selectedcityid].center.y == targety)
	if (isCityCenter(id, targetx, targety) || cities[id].tiles[targetx + "_" + targety] != undefined){
		return
	}

	//check if tile is in another city
	if (isTileCity(targetx, targety)){
		return
	}

	//ensure that there is enough population for expansion to occur
	//first check for city center
	if (isCityCenter(id, x, y)){
		if (cities[id].center.population - targetpop < mincitytilepop){
			alert("Not enough population to expand!")
			return
		}
		cities[id].center.population -= targetpop
	}
	else{
		//and now check for other tiles
		if (cities[id].tiles[x + "_" + y].population - targetpop < mincitytilepop){
			alert("Not enough population to expand!")
			return
		}
		cities[id].tiles[x + "_" + y].population -= targetpop
	}

	cities[id].tiles[targetx + "_" + targety] = new Object()

	//var loader = new THREE.GLTFLoader();

	//loader.load('/resources/buildings/townhall.glb',
		// called when the resource is loaded
		//function ( gltf ) {


	var texture = THREE.SkeletonUtils.clone(TOWN_HALL_TEXTURE)//TOWN_HALL_TEXTURE.clone()

	//texture.scale.set( 1, 1, 1 );
	//gltf.scene.children[1].children[0].distance = 0.5
	var zoff = getTileAt(targetx, targety).height + base_tile_height
	texture.position.set(targetx, targety, ground_z + zoff)

	texture.rotation.x = Math.PI / 2
	texture.city = true
	texture.cityID = id
	texture.visible = false

	if (activetiles.includes(targetx + "," + targety) || self){
		texture.visible = true
	}

	scene.add( texture );

	assignCity(targetx, targety, id, texture)

	cities[id].tiles[targetx + "_" + targety].x = targetx
	cities[id].tiles[targetx + "_" + targety].y = targety
	cities[id].tiles[targetx + "_" + targety].mesh = texture
	cities[id].tiles[targetx + "_" + targety].population = 50
	cities[id].tiles[targetx + "_" + targety].pop_size = 1

	if (self){
		activateTilesAtCenter(targetx, targety)
		showCitySidebar(id, x, y)
	}

	if (in_city_tile_view){
		showCityTileView(id)
	}

	assignTileFood(targetx, targety)
		//}
	//)

	var tile = getTileAt(targetx, targety)
	var l = tile.children.length
	for (var i = 0; i < l; i++){
		if (tile.children[0].tree == true){
			tile.children.pop(0)
		}
	}

	modifyTileBordersOnExpand(x, y, targetx, targety, self)

	checkAndLoad(targetx, targety, self)

	if (self){
		checkForAdjacentCities(targetx, targety)
	}

	if (self){
		socket.emit('expandcity', dir[0], dir[1], x, y, id)
	}
	//exploreAtCoords(targetx, targety)

	createTileGrid(targetx, targety, false)
}


function getTotalPop(cityID){
	var pop = 0

	pop += cities[cityID].center.population

	for (var tile of Object.keys(cities[cityID].tiles)){
		pop += cities[cityID].tiles[tile].population
	}

	return pop
}

function changeCityProduction(type){
	if (isNaN(selectedcityid) || selectedcityid === ''){
		return
	}

	if (document.getElementById("select_unit_to_produce_" + type).value == ''){
		cities[selectedcityid].producing[type] = null
	}
	else{
		cities[selectedcityid].producing[type] = document.getElementById("select_unit_to_produce_" + type).value
		//cities[selectedcityid].production_progress[type] = 0
	}

	showCitySidebar(selectedcityid, selectedcitytilex, selectedcitytiley)
}


var city_x_offset = 0
var cities = []
var citynames = []
var naming_city = false
var current_city = ''
function buildCity(id, name=''){
	if (id == 'null'){
		return
	}
	if (unitlist[id].type != "P"){
		return
	}
	if (unitlist[id].m <= 0){
		return
	}

	var already_named = false
	if (name != ''){
		if (name.length > 20){
			return
		}
		else{
			already_named = true
		}
	}

	var cityx = unitlist[id].x * 1
	var cityy = unitlist[id].y * 1

	if (isTileCity(cityx, cityy)){
		return
	}

	var citypop = unitlist[id].n * 1


	naming_city = true
	if (already_named){
		naming_city = false
	}

	scene.remove(unitlist[id].mesh)

	assignTileUnitStatus(cityx, cityy, false)

	//keep this id temporarily since both pop and unselect will get rid of it
	var temp_id = id

	unSelectUnit(temp_id)

	unitlist[temp_id] = 'removed'

	var this_city = new Object()
	this_city.center = new Object()

	if (isTileAdjacentToWater(cityx, cityy)){
		this_city.coastal = true
	}
	else{
		this_city.coastal = false
	}

	this_city.producing = new Object()
	for (var type of unit_types){
		this_city.producing[type] = null
	}
	this_city.production_progress = new Object()
	for (var type of unit_types){
		this_city.production_progress[type] = 0
	}

	//var loader = new THREE.GLTFLoader();

	//loader.load('/resources/buildings/cityhall.glb',
		// called when the resource is loaded
		//function ( gltf ) {

			//var texture = gltf.scene
	var texture = THREE.SkeletonUtils.clone(CITY_HALL_TEXTURE)//CITY_HALL_TEXTURE.clone()

	//texture.scale.set( 1, 1, 1 );
	//gltf.scene.children[1].children[0].distance = 0.5
	var zoff = getTileAt(cityx, cityy).height + base_tile_height
	texture.position.set(cityx + city_x_offset, cityy, ground_z + zoff)
	texture.cityID = cities.length

	texture.rotation.x = Math.PI / 2
	texture.city = true
	texture.visible = false

	if (activetiles.includes(cityx + "," + cityy)){
		texture.visible = true
	}

	scene.add( texture );

	this_city.center.mesh = texture
	assignCity(cityx, cityy, cities.length, texture)

	if (already_named){
		citynames.push(name)
		this_city.name = name
		this_city.center.mesh.cityname = name
		this_city.cityID = cities.length
		cities.push(this_city)
	}

	assignTileFood(cityx, cityy)

			//activateTilesAtCenter(cityx, cityy)
		//}
	//)

	var tile = getTileAt(cityx, cityy)
	var l = tile.children.length
	for (var i = 0; i < l; i++){
		if (tile.children[0].tree == true){
			tile.children.pop(0)
		}
	}

	this_city.center.x = cityx
	this_city.center.y = cityy
	this_city.center.population = citypop

	this_city.tiles = new Object()

	current_city = this_city

	if (already_named){
		this_city.owner = 'notself'
	}
	if (!already_named){
		this_city.owner = 'self'
		showCityNamePanel(id)
	}

	drawTileBorders(this_city.center.x, this_city.center.y, [1, 2, 3, 4], !already_named)

	createTileGrid(this_city.center.x, this_city.center.y, true)
}


unitlist = []

function drawUnits(i, emit = true){
	//for (var i = 0; i < units.length; i++){
		if (units[i] == ''){
			return
		}
		if (emit){
			socket.emit('unitcreated', units[i])
		}
		var info = units[i].split("~")
		var unittype = info[0]
		var unitinfo = info[1].split(",")
		var thisunit = {}
		thisunit.unitid = i
		thisunit.type = unittype
		for (var keyvalpair of unitinfo){
			var spl = keyvalpair.split(":")
			var key = spl[0]
			var val = spl[1]
			thisunit[key] = val
		}

		if (emit){
			thisunit.owner = 'self'
			activateTilesAtCenter(thisunit.x, thisunit.y)
		}
		else{
			thisunit.owner = 'notself'
		}

		unitlist.push(thisunit)
		assignTileUnitStatus(thisunit.x, thisunit.y, true, i)
		if (activetiles.includes(thisunit.x + "," + thisunit.y)){
			var vis = true
		}
		else{
			var vis = false
		}


		if (unittype == "P"){
			//fetchAndRender([thisunit.x * 1, thisunit.y * 1], [thisunit.x*1 + 1, thisunit.y*1 + 1])
			drawPeople(thisunit.x, thisunit.y, thisunit.unitid, vis)
		}
		if (unittype == "RB"){
			drawRiverboat(thisunit.x, thisunit.y, thisunit.unitid, vis)
		}
		if (unittype == "L"){
			drawLegion(thisunit.x, thisunit.y, thisunit.unitid, vis)
		}
	//}
}


//TILE FETCHING AND DRAWING CODE

function fetchAndRender(coords1, coords2){
	for (var y = coords1[1]; y < coords2[1]; y++){
		for (var x = coords1[0]; x < coords2[0]; x++){
			var req = new XMLHttpRequest;
			req.open("GET", "/gettile?x=" + x + "&y=" + y + "&file=" + FILE)
			req.send()
			req.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200){
					var r = this.responseText.replace("[", '').replace("]", '')
					r = r.replace("{", '').replace("}", '').split('","')
					r[0] = r[0].split(":")[1].replaceAll('"', '')
					r[1] = r[1].split(":")[1].replaceAll('"', '')
					var x = r[0].split("_")[0] * 1
					var y = r[0].split("_")[1] * 1
					draw(x, y, r[1])
				}
			}
		}
	}
}

//draw the terrain
//function draw(coords1, coords2, data){
var WATERGEO = new THREE.PlaneGeometry(1, 1)
var BASE_TILE_GEO = new THREE.BoxGeometry(1, 1, 0.2)
function draw(x, y, data){
	if (getTileAt(x, y) != undefined){
		return
	}
	//var tiledata = data[y % 100][x % 100].split("#")[1]
	//var height = data[y % 100][x % 100].split("#")[0] * 1
	var tiledata = data.split(HEIGHT_DELIMITER)[1]
	var height = data.split(HEIGHT_DELIMITER)[0] * 1
	var type = tiledata.split(INFO_DELIMITER)[0]
	var forest = false

	if (type == LAND_TILE_CODE){
		col = getLandCol(x, y)
	}

	if (isWater(type)){
		col = getWaterCol(x ,y)
	}

	if (type == FOREST_TILE_CODE || type == FOREST_START_TILE_CODE){
		forest = true;
		treestodraw = tiledata.split("|")[1] * 1
		col = getForestCol(x, y)
	}

	if (type == DESERT_TILE_CODE){
		col = getDesertCol(x, y)
	}

	if (height == 0 && isWater(type)){
		var geometry = WATERGEO//new THREE.PlaneGeometry( 1, 1 );
	}
	else if (height == 0 && !isWater(type)){
		height = height + base_tile_height
		var geometry = new THREE.BoxGeometry(1, 1, height)
	}
	else{
		height = height + base_tile_height
		if (height === 0.2){
			var geometry = BASE_TILE_GEO
		}
		else{
			var geometry = new THREE.BoxGeometry(1, 1, height)
		}
		var heightmod = 1 - height/5
		var mincolormtn = 0.2

		if (height > MOUNTAIN_FOREST_HEIGHT && type != DESERT_TILE_CODE){
			col = getForestCol(x, y)
		}
		for (var it = 0; it < height - 2; it++){
			col.r = col.r + (mincolormtn - col.r) / 2
			col.g = col.g + (mincolormtn - col.g) / 2
			col.b = col.b + (mincolormtn - col.b) / 2
		}
		if (height > MOUNTAIN_STONE_HEIGHT){
			col = getStoneCol(x, y)
		}
		if (height > MOUNTAIN_FOREST_HEIGHT && height < MOUNTAIN_STONE_HEIGHT && type == DESERT_TILE_CODE){
			col = getDesertElevCol(x, y)
		}
		if (height > MOUNTAIN_SNOWCAP_HEIGHT && height <= MOUNTAIN_SNOW_HEIGHT){
			var faces = geometry.faces
			for (var face of faces){
				if (face.normal.z == 1){
					face.color.set(getSnowCol(x, y))
				}
				else{
					face.color.set(col)
				}
			}
			geometry.colorsNeedUpdate = true;//col = getSnowCol()
		}
		if (height > MOUNTAIN_SNOW_HEIGHT){
			col = getSnowCol(x, y)
		}
	}
	geometry = new THREE.BufferGeometry().fromGeometry(geometry)

	var tilematerial = new THREE.MeshBasicMaterial( {color: col, vertexColors: THREE.FaceColors } )//, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, tilematerial );
	plane.istile = true
	plane.type = type
	plane.height = height - base_tile_height
	plane.name = "tile_" + x + "_" + y
	grid_dict["tile_" + x + "_" + y] = plane

	plane.position.set(x, y, ground_z + height/2)

	plane.lookAt(x, y, 50)
	scene.add(plane);

	if (forest){
		for (var treegen = 0; treegen < treestodraw; treegen++){
			drawTree([x, y], height, 1)
			drawTree([x, y], height, 2)
			drawTree([x, y], height, 3)
		}
	}

	var treeprob = 324 * WORLD_SEED / (x * y / 23)
	treeprob = (treeprob % 40) / 40

	if (treeprob > 0.9 && type == 'l') {
		drawTree([x, y], height, 1)
		//drawTree([x, y], height)
	}

	if (exploredtiles.includes(x + "," + y)){
	}
	else{
		plane.visible = false
	}
}


document.onkeypress = function (e) {
	if (naming_city){
		return
	}
	var code = e.keyCode
	var letter = String.fromCharCode(code)
	if (letter == 'c'){
		center()
		return
	}
	if (letter == 's'){
		if (cameralooking == 'front'){
			camera.lookAt(camera.position.x, camera.position.y - 5, camera.position.z - 5)
			camera.position.y += 10
			camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI)
			cameralooking = 'back'
			directionalLight_fromSouth.position.set(camera.position.x, camera.position.y, ground_z + light_z_offset)
			directionalLight_fromSouth.target.position.set(camera.position.x, camera.position.y - 5, ground_z)
		}
	}
	if (letter == 'w'){
		if (cameralooking == 'back'){
			camera.lookAt(camera.position.x, camera.position.y + 5, camera.position.z - 5)
			camera.position.y -= 10
			//camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI)
			cameralooking = 'front'
			directionalLight_fromSouth.position.set(camera.position.x, camera.position.y, ground_z + light_z_offset)
			directionalLight_fromSouth.target.position.set(camera.position.x, camera.position.y + 5, ground_z)
		}
	}
	if (letter == 'z'){
		camera.position.z -= 0.2
	}

	if (letter == 'g' && selectedunitid != 'null'){
		moving_unit = true
		updateUnitBar(selectedunitid)
	}

	if (letter == 'b' && selectedunitid != 'null'){
		if (unitlist[selectedunitid].type == "P"){
			buildCity(selectedunitid)
		}
	}

	if (letter == 'v' && selectedcityid != "null"){
		showCityTileView(selectedcityid)
	}
};

var velcap = 5
var leftarrowdown = false
var rightarrowdown = false
var uparrowdown = false
var downarrowdown = false
document.onkeydown = function(e) {
	if (naming_city){
		return
	}

	var code = e.keyCode

	if (in_tile_level_interface){
		unSelectSubtile()
		return
	}

	var cameramovement = 0.6
	var realign = false;
	if (cameralooking == 'back'){
		cameramovement *= -1
	}

	if (code == esckeycode){
		if (in_tile_level_interface){
			return
		}
		if (redirecting_food){
			redirecting_food = false
			return
		}
		if (selectedunitid != "null"){
			unSelectUnit(selectedunitid)
			return
		}
		if (in_city_tile_view){
			hideCityTileView()
			return
		}
		if (viewing_city_sidebar){
			hideCitySidebar()
			return
		}
	}

	if (code == endturnkeycode){//enterkeycode){
		endTurn()
	}

	if (code == leftarrowcode){
		leftarrowdown = true
		//cameravelocity.x -= cameramovement
		//camera.position.x -= cameramovement
	}
	if (code == rightarrowcode){
		rightarrowdown = true
		//cameravelocity.x += cameramovement
		//camera.position.x += cameramovement
	}
	if (code == uparrowcode){
		uparrowdown = true
		//cameravelocity.y += cameramovement
		//camera.position.y += cameramovement
	}
	if (code == downarrowcode){
		downarrowdown = true
		//cameravelocity.y -= cameramovement
		//camera.position.y -= cameramovement
	}

	if (code == spacekeycode){
		camera.position.z += 0.2
	}

	if (cameravelocity.x > velcap){
		cameravelocity.x = velcap
	}
	if (cameravelocity.y > velcap){
		cameravelocity.y = velcap
	}
	if (cameravelocity.x < -velcap){
		cameravelocity.x = -velcap
	}
	if (cameravelocity.y < -velcap){
		cameravelocity.y = -velcap
	}
	if (realign){
		//controls.target = new THREE.Vector3(camera.position.x, camera.position.y - camerainity, camera.position.z - camerainitz)
	}
}

document.onkeyup = function(event){
	var code = event.keyCode
	
	if (code == leftarrowcode){
		leftarrowdown = false
		//camera.position.x -= cameramovement
	}
	if (code == rightarrowcode){
		rightarrowdown = false
		//camera.position.x += cameramovement
	}
	if (code == uparrowcode){
		uparrowdown = false
		//camera.position.y += cameramovement
	}
	if (code == downarrowcode){
		downarrowdown = false
		//camera.position.y -= cameramovement
	}
}

function pauseGame(){
	paused = true
	//var b = document.getElementById("play_or_pause")
	//b.textContent = "Play Game"
	//b.style.backgroundColor = "#88b488"
}

function playGame(){
	paused = false
	//var b = document.getElementById("play_or_pause")
	//b.textContent = "Pause Game"
	//b.style.backgroundColor = "#b48888"
}

function pauseOrPlayGame(){
	if (paused){
		playGame()
		requestAnimationFrame(animate)
	}
	else if (!paused){
		pauseGame()
	}
}


window.addEventListener( 'resize', onWindowResize, false );

var resize_timeout;

function onWindowResize(){

	clearTimeout(resize_timeout)

	resize_timeout = setTimeout(function(){
	    tile_level_renderer.setSize( window.innerHeight, window.innerHeight );

	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize( window.innerWidth, window.innerHeight )
	}, 150)
}

var decel_amt = 0.05
var paused = false
function animate() {
	if (!paused){
		var cameramovement = 0.15

		if (cameralooking == 'back'){
			cameramovement *= -1
		}

		if (leftarrowdown){
			cameravelocity.x -= cameramovement
			//camera.position.x -= cameramovement
		}
		if (rightarrowdown){
			cameravelocity.x += cameramovement
			//camera.position.x += cameramovement
		}
		if (uparrowdown){
			cameravelocity.y += cameramovement
			//camera.position.y += cameramovement
		}
		if (downarrowdown){
			cameravelocity.y -= cameramovement
			//camera.position.y -= cameramovement
		}


		var xcammod = cameravelocity.x * 0.1
		var ycammod = cameravelocity.y * 0.1
		camera.position.x += xcammod
		camera.position.y += ycammod


		//deal with deceleration of camera
		var x_vel_sign = 1
		var y_vel_sign = 1
		if (cameravelocity.x != 0){
			x_vel_sign = cameravelocity.x / Math.abs(cameravelocity.x)
		}
		if (cameravelocity.y != 0){
			y_vel_sign = cameravelocity.y / Math.abs(cameravelocity.y)
		}

		var x_temp_vel = Math.abs(cameravelocity.x) - decel_amt
		var y_temp_vel = Math.abs(cameravelocity.y) - decel_amt

		if (x_temp_vel < 0){
			x_temp_vel = 0
		}

		if (y_temp_vel < 0){
			y_temp_vel = 0
		}

		cameravelocity.x = x_temp_vel * x_vel_sign
		cameravelocity.y = y_temp_vel * y_vel_sign


		//cameravelocity.x += (-cameravelocity.x) * 0.1
		//cameravelocity.y += (-cameravelocity.y) * 0.1

		//controls.update();

		/*directionalLight_fromSouth.position.set(camera.position.x, camera.position.y, ground_z + light_z_offset)
		if (cameralooking == 'front'){
			directionalLight_fromSouth.target.position.set(camera.position.x, camera.position.y + 5, ground_z)
		}
		else{
			directionalLight_fromSouth.target.position.set(camera.position.x, camera.position.y - 5, ground_z)
		}*/
		//scene.add(directionalLight_fromSouth);
		//scene.add(directionalLight_fromSouth.target)

		renderer.render( scene, camera );

		updateCityLabels()
	}

	if (in_tile_level_interface){
		tile_level_renderer.render( tile_level_scene, tile_level_camera)
	}

	requestAnimationFrame( animate );
}

var done_init = false
//init function



if (!multi){
	var filereq = new XMLHttpRequest;
	filereq.open("GET", "/numsaves")
	filereq.send()
	filereq.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			FILE = "map" + String(Math.ceil(Math.random() * (this.responseText * 1)))
			var spawnlocreq = new XMLHttpRequest;
			spawnlocreq.open("GET", "/spawnlocsbyfile/" + FILE)
			spawnlocreq.send()
			spawnlocreq.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200){
					var locs = this.responseText.split("\n")
					loc = locs[0]
					loc = loc.split(",")
					let x = loc[0] * 1
					let y = loc[1] * 1
					initialize(x, y, locs)
				}
			}
		}
	}
}
//initialize()


//SOCKET HANDLING AND SUCH
socket.on('whoareyou', function(){
	socket.emit('i_am', GAMEID)
})

socket.on('yourturn', function(playernum){
	if (!done_init){
		var room = window.location.href.split("/").slice(-1)
		var spawnlocreq = new XMLHttpRequest;
		spawnlocreq.open("GET", "/spawnlocs/" + room)
		spawnlocreq.send()
		spawnlocreq.onreadystatechange = function (){
			if (this.readyState == 4 && this.status == 200){
				var locs = this.responseText.split("\n")
				locs.pop()
				//console.log(locs)
				loc = locs[playernum]
				loc = loc.split(",")
				let x = loc[0] * 1
				let y = loc[1] * 1
				initialize(x, y, locs)
				done_init = true
			}
		}
	}
	else{
		hideTurnWaitScreen()
	}
	//myturn = true
})


var ending_game = false
socket.on('endgame', function(){
	if (ending_game){
		return
	}
	ending_game = true
	setTimeout(function(){
		window.location.replace("/")
	}, 2000)
	alert("A player left the game. Ending game, redircting back home...")
})

//SOCKET GAME MECHANICS
socket.on('unitcreated', function(unit){
	//console.log("here", unit)
	units.push(unit)
	if (done_init){
		drawUnits(units.length - 1, false)
	}
})

socket.on('moveunit', function(id, x, y, z){
	if (id > unitlist.length - 1){
		return
	}

	checkAndLoad(x, y, false)

	//if (exploredtiles.includes(unitlist[id].mesh.position.x + "," + unitlist[id].mesh.position.y)){
	assignTileUnitStatus(unitlist[id].mesh.position.x, unitlist[id].mesh.position.y, false)
	//}

	//if (exploredtiles.includes(x + "," + y)){
	assignTileUnitStatus(x, y, true, id)
	//}
	unitlist[id].mesh.position.set(x, y, z)
	unitlist[id].x = x * 1
	unitlist[id].y = y * 1

	if (activetiles.includes(x + "," + y)){
		unitlist[id].mesh.visible = true
	}
	else{
		unitlist[id].mesh.visible = false
	}
})

socket.on('buildcity', function(id, name){
	buildCity(id, name)
})

socket.on('expandcity', function(dir0, dir1, x, y, id){
	expandCity([dir0, dir1], x, y, id, false)
})

socket.on('redirectfood', function(x1, y1, x2, y2, amt){
	console.log(x1, x2, y1, y2, amt)
	reAssignFood([x1*1, y1*1], [x2*1, y2*1], amt*1)
})

socket.on('addbuilding', function(subtile, texturename, x, y, id){
	renderBuilding(texturename, subtile, x, y, id, false)
})

socket.on('removebuilding', function(subtile, x, y, id){
	removeBuilding(subtile_code, x, y, id)
})
