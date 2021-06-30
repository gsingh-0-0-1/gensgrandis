/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function loadGameFromBrowser(){

	for (var tname of TEXTURE_LIST){
		if (window[tname] === null || window[tname] === undefined){
			setTimeout(function(){
				loadGameFromBrowser()
			}, 500)
			return
		}
	}

	exploredtiles = window.localStorage.getItem("et").split("|")
	WORLD_SEED = window.localStorage.getItem("seed") * 1
	for (var expltile of exploredtiles){
		var tx = expltile.split(",")[0] * 1
		var ty = expltile.split(",")[1] * 1
		fetchAndRender([tx - 2, ty - 2], [tx + 3, ty + 3])
	}

	loadCities()

	var temp = window.localStorage.getItem("units")

	if (temp != ""){
		temp = temp.split("\n")
		temp.pop()
	}
	units.push(...temp)
	//console.log(temp, units)
	for (var i = 0; i < units.length; i++){
		//console.log(i)
		drawUnits(i, true)
	}

	//addToMiniMap(500, 500)

	hideLoadingScreen()
	hideTerrainLoadScreen()
	hideTurnWaitScreen()

	gui.addEventListener( 'click', onMouseClick, false );
	camera.position.set(camerainitx, camerainity, camerainitz)
	camera.lookAt(camerainitx, camerainity + 5, camerainitz - 5)
	animate();

	saveGameData(false)

	closeCustomAlert(document.getElementById("unit_done_alert"))
}

function finishLoading(){

}

function initialize(centerx, centery, spawnlocs){

	activateTilesAtCenter(centerx, centery, false)

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
		if (window.localStorage.getItem(SAVE_VERSION) == "t"){
			loadGameFromBrowser(camerainitx, camerainity, camerainitz)
			return
		}
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
							exploredtiles = centerx + "," + centery
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


							setTimeout(function(){
								let init_ind = units.length
								if (init_ind < 0){
									init_ind = 0
								}

								var temp = people_template

								temp = temp.replace("xhere", centerx).replace("yhere", centery).replace("ohere", "self")
								units.push(temp)

								var temp = scout_template
								temp = temp.replace("xhere", centerx + 1).replace("yhere", centery).replace("ohere", "self")
								units.push(temp)
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
								
								if (multi){
									endTurn()
								}
								hideLoadingScreen()

								if (!multi){
									hideTurnWaitScreen()
								}

								if (multi){
									hideTerrainLoadScreen()
								}

								//addToMiniMap(gamecenterx, gamecentery)

								if (!multi){
									//if (window.localStorage.getItem(SAVE_VERSION) == "t"){
										if (window.localStorage.getItem("tl") != "t"){
											loadAndSaveTerrain()
										}

										if (window.localStorage.getItem("us") != "t"){
											saveUnits()
										}

										if (window.localStorage.getItem("cs") == "t"){
											loadCities()
										}

										saveGameData(false)
									//}
								}

								hideTerrainLoadScreen()
							}, 2000 )		
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