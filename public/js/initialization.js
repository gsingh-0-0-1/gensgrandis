/* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
/* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function initialize(centerx, centery, spawnlocs){

	activateTilesAtCenter(centerx, centery)

	gamecenterx = centerx
	gamecentery = centery

	camerainitx = gamecenterx
	camerainity = gamecentery - 5
	camerainitz = 5

	camera.position.set(camerainitx, camerainity, camerainitz)

	filereq = new XMLHttpRequest;

	if (multi){
		var room = window.location.href.split("/").slice(-1)
		filereq.open("GET", "/gamefile/" + room)
	}
	else{
		filereq.open("GET", "/numsaves")
	}

	filereq.send()
	filereq.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){

			if (multi){
				FILE = this.responseText
			}
			else{
				//FILE = "map" + String(Math.ceil(Math.random() * (this.responseText * 1)))
			}

			var seedreq = new XMLHttpRequest;
			seedreq.open("GET", "/seed?file=" + FILE)
			seedreq.send()

			seedreq.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200){
					WORLD_SEED = this.responseText * 1


					/*var explreq = new XMLHttpRequest;
					explreq.open("GET", "/explored?file=" + FILE)
					explreq.send()*/

					//explreq.onreadystatechange = function(){
						//if (this.readyState == 4 && this.status == 200){
							exploredtiles = centerx + "," + centery //this.responseText
							exploredtiles = exploredtiles.split("\n")

							for (var expltile of exploredtiles){
								var tx = expltile.split(",")[0] * 1
								var ty = expltile.split(",")[1] * 1
								//checkAndLoad(tx, ty)
								fetchAndRender([tx - 2, ty - 2], [tx + 3, ty + 3])
							}

							//fetchAndRender([gamecenterx - 3, gamecentery - 3], [gamecenterx + 3, gamecentery + 3])

							if (multi){
								for (var loc of spawnlocs){
									var nloc = loc.split(",")
									//checkAndLoad(nloc[0]*1, nloc[1]*1)
									fetchAndRender([nloc[0]*1 - 1, nloc[1]*1 - 1], [nloc[0]*1 + 2, nloc[1]*1 + 2])
								}
							}

							var unitreq = new XMLHttpRequest;
							unitreq.open("GET", "/units?file=" + FILE)
							setTimeout( function(){unitreq.send()}, 2000 )

							unitreq.onreadystatechange = function(){
								if (this.readyState == 4 && this.status == 200){
									let init_ind = units.length
									if (init_ind < 0){
										init_ind = 0
									}
									let temp = this.responseText
									temp = temp.split("\n")
									temp.pop()
									temp[0] = temp[0].replace("xhere", centerx).replace("yhere", centery)
									units.push(...temp)
									//console.log(temp, units)
									for (var i = 0; i < units.length; i++){
										//console.log(i)
										if (i < init_ind){
											drawUnits(i, false)
										}
										else{
											drawUnits(i, true)
										}
									}
									endTurn()
									hideLoadingScreen()
									if (!multi){
										hideTurnWaitScreen()
									}
									addToMiniMap(gamecenterx, gamecentery)
								}
							}			
						//}
					//}
				}
			}
		}
	}


	gui.addEventListener( 'click', onMouseClick, false );
	//fetchAndRender([100, 0])


	camera.lookAt(camerainitx, camerainity + 5, camerainitz - 5)

	//renderer.gammaOutput = true


	animate();
}