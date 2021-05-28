var loader = new THREE.GLTFLoader();

var PEOPLE_LOADED_MESH = null

loader.load('/resources/units/people_new.glb',
	// called when the resource is loaded
	function ( gltf ) {
		PEOPLE_LOADED_MESH = gltf.scene
	}
)


var RIVERBOAT_LOADED_MESH = null

loader.load('/resources/units/riverboat.glb',
	// called when the resource is loaded
	function ( gltf ) {
		RIVERBOAT_LOADED_MESH = gltf.scene
	}
)



var LEGION_LOADED_MESH = null

loader.load('/resources/units/legion.glb',
	// called when the resource is loaded
	function ( gltf ) {
		LEGION_LOADED_MESH = gltf.scene
	}
)


var SCOUT_LOADED_MESH = null

loader.load('/resources/units/scout_new.glb',
	function (gltf) {
		SCOUT_LOADED_MESH = gltf.scene
	}
)


var CITY_HALL_TEXTURE = null

var CODE_TEXTURE_DICT = {}

loader.load('/resources/buildings/cityhall.glb',
	function(gltf){
		CITY_HALL_TEXTURE = gltf.scene
		CITY_HALL_TEXTURE.texturename = "cityhall"
		CODE_TEXTURE_DICT["cityhall"] = CITY_HALL_TEXTURE
	}
)


var TOWN_HALL_TEXTURE = null

loader.load('/resources/buildings/townhall.glb',
	function (gltf){
		TOWN_HALL_TEXTURE = gltf.scene
		TOWN_HALL_TEXTURE.texturename = 'townhall'
		CODE_TEXTURE_DICT['townhall'] = TOWN_HALL_TEXTURE
	}
)


var FARM_TEXTURE = null

loader.load('/resources/buildings/farm.glb',
	function (gltf){
		FARM_TEXTURE = gltf.scene
		FARM_TEXTURE.texturename = "FA"
		CODE_TEXTURE_DICT["FA"] = FARM_TEXTURE
	}
)


var BARRACKS_TEXTURE = null

loader.load('/resources/buildings/barracks.glb',
	function (gltf){
		BARRACKS_TEXTURE = gltf.scene
		BARRACKS_TEXTURE.texturename = "BA"
		CODE_TEXTURE_DICT["BA"] = BARRACKS_TEXTURE
	}
)


var FORGE_TEXTURE = null

loader.load('/resources/buildings/forge.glb',
	function (gltf){
		FORGE_TEXTURE = gltf.scene
		FORGE_TEXTURE.texturename = "FO"
		CODE_TEXTURE_DICT["FO"] = FORGE_TEXTURE
	}
)

var ARMORY_TEXTURE = null

loader.load('/resources/buildings/armory.glb',
	function (gltf){
		ARMORY_TEXTURE = gltf.scene
		ARMORY_TEXTURE.texturename = "AM"
		CODE_TEXTURE_DICT["AM"] = ARMORY_TEXTURE
	}
)

var TEXTURE_LIST = ["PEOPLE_LOADED_MESH", 
"SCOUT_LOADED_MESH", 
"RIVERBOAT_LOADED_MESH", 
"LEGION_LOADED_MESH", 
"CITY_HALL_TEXTURE", 
"TOWN_HALL_TEXTURE", 
"FARM_TEXTURE", 
"ARMORY_TEXTURE", 
"BARRACKS_TEXTURE", 
"FORGE_TEXTURE"]

