//PEOPLE
function addPeople(x, y){
	//console.log(units)
	units.push(people_template.replace("xhere", x).replace("yhere", y))
	drawUnits(units.length - 1)
}

function drawPeople(x, y, id, vis = true){

	var col = new THREE.Color(0.4, 0.4, 0.4)//0.6, 0, 0.8)

	var loader = new THREE.GLTFLoader();

	loader.load('/resources/people.glb',
		// called when the resource is loaded
		function ( gltf ) {

			gltf.scene.scale.set( 1, 1, 1 );	

			gltf.scene.position.set(x, y, ground_z + 1)

			//gltf.scene.children[2].position = new THREE.Vector3(x, y, ground_z + 1)

			//gltf.scene.rotation.x = Math.PI / 2
			var people = gltf.scene//.children[2]
			scene.add( people );

			var hoffset = getTileAt(x, y).height

			people.position.set(x, y, ground_z + hoffset + 1)
			people.rotation.set(Math.PI / 2, 0, 0)

			people.type = "unit"

			people.visible = vis
			assignUnitID(people, id)
			//people.unitid = id

			unitlist[id].mesh = people
			unitlist[id].naval = false

			//modify explored tiles
			if (vis){
				exploreAtCoords(x, y)
			}
		}
	)

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}

}


//RIVERBOAT
function addRiverboat(x, y){
	units.push(riverboat_template.replace("xhere", x).replace("yhere", y))
	drawUnits(units.length - 1)
}

function drawRiverboat(x, y, id, vis = true){

	var col = new THREE.Color(0.4, 0.4, 0.4)//0.6, 0, 0.8)

	var loader = new THREE.GLTFLoader();

	loader.load('/resources/riverboat.glb',
		// called when the resource is loaded
		function ( gltf ) {

			gltf.scene.scale.set( 0.07, 0.07, 0.07 );	

			gltf.scene.position.set(x, y, ground_z + 0.2)

			//gltf.scene.children[2].position = new THREE.Vector3(x, y, ground_z + 1)

			//gltf.scene.rotation.x = Math.PI / 2
			var boat = gltf.scene//.children[2]
			scene.add( boat );

			var hoffset = getTileAt(x, y).height

			boat.position.set(x, y, ground_z + hoffset + 0.2)
			boat.rotation.set(Math.PI / 2, Math.PI / 2, 0)

			boat.type = "unit"

			boat.visible = vis
			assignUnitID(boat, id)

			unitlist[id].mesh = boat
			unitlist[id].naval = true

			//modify explored tiles
			if (vis){
				exploreAtCoords(x, y)
			}
		}
	)

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}



//LEGION
function addLegion(x, y){
	units.push(legion_template.replace("xhere", x).replace("yhere", y))
	drawUnits(units.length - 1)
}


function drawLegion(x, y, id, vis = true){
	var loader = new THREE.GLTFLoader();

	loader.load('/resources/legion.glb',
		// called when the resource is loaded
		function ( gltf ) {

			gltf.scene.scale.set( 1, 1, 1 );	

			gltf.scene.position.set(x, y, ground_z + 1)

			//gltf.scene.children[2].position = new THREE.Vector3(x, y, ground_z + 1)

			//gltf.scene.rotation.x = Math.PI / 2
			var legion = gltf.scene//.children[2]
			scene.add( legion );

			var hoffset = getTileAt(x, y).height

			legion.position.set(x, y, ground_z + hoffset + 0.7)
			legion.rotation.set(Math.PI / 2, Math.PI, 0)

			legion.type = "unit"

			legion.visible = vis
			assignUnitID(legion, id)

			unitlist[id].mesh = legion
			unitlist[id].naval = false

			//modify explored tiles
			if (vis){
				exploreAtCoords(x, y)
			}
		}
	)

	//get the height of the tile and offset the unit by that
	if (getTileAt(x, y) == undefined){
		console.log(x, y)
	}
}


