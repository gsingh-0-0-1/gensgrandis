/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

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

function addSong(id, name, cont){

	var tempreq = new XMLHttpRequest;
	tempreq.open("GET", "/templates/audiotemplate.html")
	tempreq.send()

	tempreq.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			var n = new DOMParser().parseFromString(this.responseText, "text/xml");

			n = n.children[0].children[1].children[0]

			n.id = id


			n.children[0].id = id + "_player"
			n.children[0].children[0].src = "/sounds/" + id + ".mp3"

			n.children[1].children[0].id = id + "_songname"

			n.children[1].children[0].textContent = name

			n.style.display = "initial"

			cont.appendChild(n)
			//cont.appendChild(document.createElement('br'))

		}
	}
}

var audioVolume = 0
var current_playing_id = null
var muted = true

function handleSoundtrackButton(){
	if (muted){
		muted = false
		muteOrUnmute()
		document.getElementById("soundtrack_button").style.backgroundColor = "#88b488"
		document.getElementById("soundtrack_button").value = "Soundtrack On"
		return
	}
	muted = true
	muteOrUnmute()
	document.getElementById("soundtrack_button").style.backgroundColor = "#b48888"
	document.getElementById("soundtrack_button").value = "Soundtrack Off"
}

function switchAudioVolume(){
	if (audioVolume < 1){
		audioVolume = 1
		return
	}
	audioVolume = 0
}

function muteOrUnmute(id = current_playing_id){
	switchAudioVolume()
	if (id == null){
		return
	}
	document.getElementById(id).volume = audioVolume
}

function setPlayerVolume(id, volume = audioVolume){
	document.getElementById(id).volume = volume
}

function getPlayerVolume(id){
	return document.getElementById(id)
}

function setAudioVolume(v){
	audioVolume = v
}

function rampUpSongVolume(id){
	if (getPlayerVolume(id) >= 1){
		setPlayerVolume(id, 1)
		return
	}
	let targetvol = document.getElementById(id).volume + 0.01
	if (targetvol > 1){
		targetvol = 1
	}
	document.getElementById(id).volume = targetvol
	setTimeout(function(){
		rampUpSongVolume(id + '')
	}, 20)
}

function playSongFromSoundtrack(n){
	if (isNaN(n)){
		return
	}
	n = n * 1
	var songid = song_ids_to_play[n % song_ids_to_play.length] + "_player"

	current_playing_id = songid

	setPlayerVolume(songid, 0)

	document.getElementById(songid).play()

	if (audioVolume != 0){
		$("#" + songid).animate({volume: 1.0}, 2000);
		//rampUpSongVolume(songid)
	}

	document.getElementById(songid).onended = function(){
		setTimeout(function(){

			playSongFromSoundtrack(n + 1)

		}, 45000)
	}
}

function startSoundtrack(t = 25000){
	setTimeout(function(){
		playSongFromSoundtrack(0)
	}, t)
}

var user_interacted = false

document.onclick = function(){
	if (!user_interacted){
		user_interacted = true
		startSoundtrack()
	}
}