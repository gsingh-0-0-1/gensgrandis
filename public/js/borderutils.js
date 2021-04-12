var outlinewidth = 0.02

var geo = new THREE.PlaneGeometry(0.02, 1, 1)
var mat = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
var self_outline_template = new THREE.Mesh(geo, mat)

var geo = new THREE.PlaneGeometry(0.02, 1, 1)
var mat = new THREE.MeshBasicMaterial({color: 0xaaaaef, side: THREE.DoubleSide})
var notself_outline_template = new THREE.Mesh(geo, mat)


function isSameCity(x1, y1, x2, y2){
	if (getTileAt(x1, y1).tileCityID === getTileAt(x2, y2).tileCityID){
		return true
	}
	else{
		return false
	}
}

function removeOutline(x, y, i){
	var tile = getTileAt(x, y).cityMesh
	tile.remove(tile["outline" + i])
	tile["outline" + i] = undefined
}

function drawOutline(tilemesh, num, self = true){
	if (self){
		var outline = self_outline_template.clone()
	}
	else{
		var outline = notself_outline_template.clone()
	}
	
	var zcoord = 0.0001//tilemesh.height / 2 + 0.0001

	if (num == 1){
		outline.position.set(0.5 - outlinewidth/2, zcoord, 0)
	}
	else if (num == 2){
		outline.position.set(-0.5 + outlinewidth/2, zcoord, 0)
	}
	else if (num == 3){
		outline.position.set(0, zcoord, -0.5 + outlinewidth/2)
		outline.rotation.z = Math.PI / 2
	}
	else if (num == 4){
		outline.position.set(0, zcoord, 0.5 - outlinewidth/2)
		outline.rotation.z = Math.PI / 2
	}
	else{
		return undefined
	}

	outline.rotation.x = Math.PI / 2

	tilemesh.add(outline)

	return outline
}


function drawTileBorders(x, y, i_list = [1, 2, 3, 4], self = true){
	var tilemesh = getTileAt(x, y).cityMesh

	for (var i of i_list){
		tilemesh["outline" + i] = drawOutline(tilemesh, i, self)
	}
}


function removeAdjacentTileBorders(x, y){
	var thistile = getTileAt(x, y)

	//check east
	var easttile = getTileAt(x + 1, y).cityMesh
	if (easttile != undefined){
		if (easttile.outline2 != undefined && isSameCity(x, y, x + 1, y)){
			removeOutline(x, y, 1)
			removeOutline(x + 1, y, 2)
		}
	}

	//check west
	var westtile = getTileAt(x - 1, y).cityMesh
	if (westtile != undefined){
		if (westtile.outline1 != undefined && isSameCity(x, y, x - 1, y)){
			removeOutline(x, y, 2)
			removeOutline(x - 1, y, 1)
		}
	}

	//check north
	var northtile = getTileAt(x, y + 1).cityMesh
	if (northtile != undefined){
		if (northtile.outline4 != undefined && isSameCity(x, y, x, y + 1)){
			removeOutline(x, y, 3)
			removeOutline(x, y + 1, 4)
		}
	}

	//check south
	var southtile = getTileAt(x, y - 1).cityMesh
	if (southtile != undefined){
		if (southtile.outline3 != undefined && isSameCity(x, y, x, y - 1)){
			removeOutline(x, y, 4)
			removeOutline(x, y - 1, 3)
		}
	}
}


function modifyTileBordersOnExpand(x1, y1, x2, y2, self = true){
	//x1 and y1 are the coords of the original tile
	//x2 and y2 are the coords of the target tile to expand into
	var xdiff = x1 - x2
	var ydiff = y1 - y2

	//var origtilemesh = getTileAt(x1, y1)
	//var targettilemesh = getTileAt(x2, y2)

	var target_i_list = []

	if (xdiff < 0){ //this means we are expanding to the east, or right
		removeOutline(x1, y1, 1)
		target_i_list = [1, 3, 4]
	}
	if (xdiff > 0){ //this means we are expanding to the west, or left
		removeOutline(x1, y1, 2)
		target_i_list = [2, 3, 4]
	}
	if (ydiff < 0){ //this means we are expanding to the north, or up
		removeOutline(x1, y1, 3)
		target_i_list = [1, 2, 3]
	}
	if (ydiff > 0){ //this means we are expanding to the south, or down
		removeOutline(x1, y1, 4)
		target_i_list = [1, 2, 4]
	}

	console.log(target_i_list)

	drawTileBorders(x2, y2, target_i_list, self)

	removeAdjacentTileBorders(x2, y2)
}