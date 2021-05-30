/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

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

function getDesertElevCol(x, y, h){
	//var offset = ((WORLD_SEED / x * y) % 9) - 4.5
	//var offset = offset/(4.5*30)
	col = getDesertCol(x, y)//new THREE.Color(116/255 + offset, 70/255, 25/255)
	col.r /= (1 + h)
	col.g /= (1 + h)
	return col
}