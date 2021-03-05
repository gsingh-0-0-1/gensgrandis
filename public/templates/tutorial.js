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