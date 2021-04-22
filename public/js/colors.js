function getLandCol(x, y){
	var offset = ((WORLD_SEED * 100 * x / y) % 9) - 4.5
	var offset = offset/(4.5*30)
	var col = new THREE.Color(0.2, 0.6 + offset, 0.2)
	return col
}

function getWaterCol(x, y){
	var offset = ((WORLD_SEED * x * y) % 9) - 4.5
	var offset = offset/(4.5*20)
	col = new THREE.Color(0.3, 0.3, 0.7 + offset)
	return col
}

function getForestCol(x, y){
	var offset = ((WORLD_SEED / x * y) % 9) - 4.5
	var offset = offset/(4.5*30)
	col = new THREE.Color(0.1, 0.5 + offset, 0.1)
	return col
}

function getSnowCol(x, y){
	var offset = ((WORLD_SEED * (x % y)) % 9) - 4.5
	var offset = offset/(4.5*30)
	col = new THREE.Color(0.90 + offset, 0.88 + offset, 0.88 + offset)
	return col
}

function getStoneCol(x, y){
	var offset = ((WORLD_SEED * (x + y)) % 9) - 4.5
	var offset = offset/(4.5*30)
	col = new THREE.Color(0.5 + offset, 0.5 + offset, 0.5 + offset)
	return col
}

function getDesertCol(x, y){
	var offset = ((WORLD_SEED / x * y) % 9) - 4.5
	var offset = offset/(4.5*30)
	col = new THREE.Color(0.9, 0.85 + offset, 0)
	return col
}

function getDesertElevCol(x, y){
	var offset = ((WORLD_SEED / x * y) % 9) - 4.5
	var offset = offset/(4.5*30)
	col = new THREE.Color(0.43 + offset, 0.37, 0.16)
	return col
}