function loopAudio(obj){
	var curloop = document.getElementById(obj.parentNode.parentNode.id + "_player").loop
	if (curloop == false){
		document.getElementById(obj.parentNode.parentNode.id + "_player").loop = true
		obj.style.backgroundColor = "#fff"
	}
	else{
		document.getElementById(obj.parentNode.parentNode.id + "_player").loop = false
		obj.style.backgroundColor = "#bbb"
	}
}