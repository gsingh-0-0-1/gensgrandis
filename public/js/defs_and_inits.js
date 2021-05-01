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

var my_turn = false

var cont = document.getElementById("music_holder")

addSong("gg_1", "Beginnings", cont)
addSong("gg_2", "Sailing", cont)
//addSong("gg_3", "March of the Legion", cont)
addSong("gg_4", "Exploring", cont)
addSong("gg_5", "Gens Grandis", cont)
addSong("gg_6", "Sly", cont)
addSong("gg_8", "Astra", cont)

var song_ids_to_play = ["gg_5", "gg_4", "gg_8", "gg_2"]

var multi = false

if (window.location.pathname.includes("room")){
	multi = true
}

if (!multi){
	//showTutorialAsk()
}

var game_init_alert = setTimeout(function(){
	//alert("Click on the person to begin the game!")
	showCustomAlert("game_init_click_reminder")
}, 15000)


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
						"L" : "Legion",
						"S" : "Scout"
					}

var unit_movements = {"P" : 5, 
						"RB" : 10, 
						"L" : 3,
						"S" : 8
					}

var unit_commands = {"P" : "B: Build city",
					"RB" : "",
					"L" : "",
					"S" : ""
				}

var unit_produce_times = {"RB" : 500,
							"L" : 250,
							"S" : 50
						}

var unit_z_offsets = {"P" : 0.1,
					"RB" : 0.2,
					"L" : 0.1,
					"S" : 0.1
				}

//unit templates
var people_template = "P~x:xhere,y:yhere,n:100,m:" + unit_movements["P"]
var riverboat_template = "RB~x:xhere,y:yhere,m:" + unit_movements["RB"]
var legion_template = "L~x:xhere,y:yhere,m:" + unit_movements["L"]
var scout_template = "S~x:xhere,y:yhere,m:" + unit_movements["S"]

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


//basic initialization
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 45, width / height, 1, 30 );
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


var selectedunitid = 'null'
var selectedcolorfactor = 1.2



//CITY STUFF

var viewing_city_sidebar = false
var selectedcityid = 'null'
var selectedcitytilex = 'null'
var selectedcitytiley = 'null'
//var tileoutline = 'null'

var in_city_tile_view = false
var redirecting_food = false

var city_x_offset = 0
var cities = []
var citynames = []
var naming_city = false
var current_city = ''

unitlist = []

var WATERGEO = new THREE.PlaneGeometry(1, 1)
var BASE_TILE_GEO = new THREE.BoxGeometry(1, 1, 0.2)

var velcap = 5
var leftarrowdown = false
var rightarrowdown = false
var uparrowdown = false
var downarrowdown = false

var decel_amt = 0.05
var paused = false

var done_init = false



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

var ending_game = false








