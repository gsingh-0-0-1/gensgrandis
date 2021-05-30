/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function showTutorialAsk(){
	document.getElementById("tutorial_ask").style.display = "initial"
}

function hideTutorialAsk(){
	document.getElementById("tutorial_ask").style.display = "none"
}

function startTutorial(){
	hideTutorialAsk()
	document.getElementById("tutorial_1").style.display = "initial"
}

function nextTutorial(obj){
	var id = obj.parentNode.id
	var num = id.split("_")[1] * 1
	document.getElementById(id).style.display = "none"
	document.getElementById("tutorial_" + (num + 1)).style.display = "initial"
}

function endTutorial(obj){
	obj.parentNode.style.display = "none"
}