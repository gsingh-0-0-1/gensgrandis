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

function addSong(id, name){
	var cont = document.getElementById("music_holder")
	var temp = document.getElementById("audio_template")

	var n = temp.cloneNode(true)
	n.id = id


	n.children[0].id = id + "_player"
	n.children[0].children[0].src = "/sounds/" + id + ".mp3"

	n.children[1].children[0].id = id + "_songname"

	n.children[1].children[0].textContent = '"' + name + '"'

	n.style.display = "initial"

	cont.appendChild(n)
}

addSong("gg_1", "Beginnings")
addSong("gg_2", "Sailing")