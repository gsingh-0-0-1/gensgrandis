/*var template = `<span id="audio_template" style="display: none">
				<audio id="">
					<source src="">
				</audio>

				<div style="padding: 5px 5px; font-size: 1vh">

					<span id=""></span> -- 
					<button class="playerbutton" style="background-color: #5a5" onclick="this.parentNode.parentNode.children[0].play(); this.parentNode.children[7].style.display = 'initial'"><i class="material-icons">play_arrow</i></button> 
					<button class="playerbutton" style="background-color: #a55" onclick="this.parentNode.parentNode.children[0].pause(); this.parentNode.children[7].style.display = 'none'"><i class="material-icons">pause</i></button> 


					<button class="playerbutton" style="background-color: #33d" onclick="this.parentNode.parentNode.children[0].currentTime = 0"><i class="material-icons">replay</i></button> 
					<button class="playerbutton" style="background-color: #bb3" onclick="this.parentNode.parentNode.children[0].currentTime -= 10"><i class="material-icons">fast_rewind</i></button> 
					<button class="playerbutton" style="background-color: #bb3" onclick="this.parentNode.parentNode.children[0].currentTime += 10"><i class="material-icons">fast_forward</i></button> 
					<button class="playerbutton" style="background-color: #bbb" onclick="javascript:loopAudio(this)"><i class="material-icons">loop</i></button> 
					<i class="material-icons" style="display: none">volume_up</i>
				</div>
			</span>`
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

			n.children[1].children[0].textContent = '"' + name + '"'

			n.style.display = "initial"

			cont.appendChild(n)
			cont.appendChild(document.createElement('br'))

		}
	}
}