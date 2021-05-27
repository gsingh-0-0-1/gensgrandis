function decompressChunk(data){
	for (var key of Object.keys(COMMON_COMPRESSES_INV)){
		data = data.split(key)
		data = data.join(COMMON_COMPRESSES_INV[key])
	}

	for (var key of Object.keys(COMMON_EXCHANGES_INV)){
		data = data.split(key)
		data = data.join(key + "\n")
	}
	data = data.split("\n")
	return data
}

function reqAndSaveChunk(y){
	var req = new XMLHttpRequest;
	req.open("GET", "/gettile?x=0&y=" + y + "&chunk=t&raw=t&file=" + FILE, true)
	req.send()
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			window.localStorage.setItem(String(y), this.responseText)
			if (String(y) === "999"){
				window.localStorage.setItem("tl", "t")
				hideTerrainLoadScreen()
			}
		}
	}
}

function loadAndSaveTerrain(){
	for (var y = 0; y < 1000; y++){
		reqAndSaveChunk(y)
	}
}

function saveUnits(){
	var u_str = ''
	for (var unit of unitlist){
		if (unit == "removed"){
			continue
		}
		var u = unit.type + "~x:" + unit.x + ",y:" + unit.y + ",m:" + unit.m
		if (unit.n != undefined && unit.n != null){
			u = u + ",n:" + unit.n
		}
		u_str = u_str + u + "\n"
	}
	window.localStorage.setItem("units", u_str)
	window.localStorage.setItem("us", "t")
}

function saveExploredTiles(){
	var s = ''
	for (var tile of exploredtiles){
		s = s + tile + "|"
	}
	window.localStorage.setItem("et", s)
}

function saveCities(a = false){
	var c_obj = {}
	for (var city of cities){
		c_obj[city.name] = {}
		c_obj[city.name].center = {}
		c_obj[city.name].center.x = city.center.x
		c_obj[city.name].center.y = city.center.y
		c_obj[city.name].center.population = city.center.population

		c_obj[city.name].producing = {}
		c_obj[city.name].production_progress = {}

		for (var prop of Object.keys(city.producing)){
			c_obj[city.name].producing[prop] = city.producing[prop]
		}

		for (var prop of Object.keys(city.production_progress)){
			c_obj[city.name].production_progress[prop] = city.production_progress[prop]
		}

		c_obj[city.name].tiles = {}
		for (var tile of Object.keys(city.tiles)){
			c_obj[city.name].tiles[tile] = {}
			for (var prop of Object.keys(city.tiles[tile])){
				if (prop == "mesh"){
					continue
				}
				c_obj[city.name].tiles[tile][prop] = city.tiles[tile][prop]
			}
		}
	}
	window.localStorage.setItem("cities", JSON.stringify(c_obj))
	window.localStorage.setItem("cs", "t")

	var tilegrid_obj = {}
	for (var city of cities){
		var l = []
		l.push([city.center.x, city.center.y])
		for (var tile of Object.keys(city.tiles)){
			l.push([tile.split("_")[0] * 1, tile.split("_")[1] * 1])
		}

		for (var pair of l){
			var c_str = pair[0] + "_" + pair[1]
			var tilegrid = getTileAt(pair[0], pair[1]).tile_grid
			for (var key of Object.keys(tilegrid)){
				if (key != "C3" && Object.keys(tilegrid[key]).length != 0){
					if (tilegrid_obj[c_str] == undefined){
						tilegrid_obj[c_str] = {}
					}
					if (tilegrid[key].building === "X" || tilegrid[key].building === ""){
						continue
					}
					tilegrid_obj[c_str][key] = tilegrid[key].building
				}
			}
		}
	}

	window.localStorage.setItem("tg", JSON.stringify(tilegrid_obj))

	if (a){
		showCustomAlert("gamesaved")
	}
	document.getElementById("gamesave_button").value = "Save Game"

	return tilegrid_obj
}

function loadCities(){
	var load = window.localStorage.getItem("cities")
	load = JSON.parse(load)
	for (var city of Object.keys(load)){
		buildCity(null, city, 'self', load[city].center.x, load[city].center.y)
	}

	for (var cityid of Object.keys(cities)){
		var tempcity = load[cities[cityid].name]
		for (var tile of Object.keys(tempcity.tiles)){
			addToCity(cityid, tile.split("_")[0] * 1, tile.split("_")[1] * 1)
		}

		for (var tile of Object.keys(tempcity.tiles)){
			cities[cityid].tiles[tile].population = load[cities[cityid].name].tiles[tile].population
		}
	}

	for (var cityid of Object.keys(cities)){
		cities[cityid].center.population = load[cities[cityid].name].center.population

		for (var prop of Object.keys(load[cities[cityid].name].producing)){
			cities[cityid].producing[prop] = load[cities[cityid].name].producing[prop]
		}
		for (var prop of Object.keys(load[cities[cityid].name].production_progress)){
			cities[cityid].production_progress[prop] = load[cities[cityid].name].production_progress[prop]
		}
	}

	var tgrid = window.localStorage.getItem("tg")
	tgrid = JSON.parse(tgrid)

	for (var tile of Object.keys(tgrid)){
		var x = tile.split("_")[0] * 1
		var y = tile.split("_")[1] * 1
		var id = getTileAt(x, y).tileCityID
		for (var key of Object.keys(tgrid[tile])){
			if (tgrid[tile][key] === "X" || tgrid[tile][key] === ""){
				continue
			}
			addBuilding(key, CODE_TEXTURE_DICT[tgrid[tile][key]], x, y, id)
		}
	}
}


function saveGameData(){
	document.getElementById("gamesave_button").value = "Saving Game..."
	saveExploredTiles()
	saveUnits()
	saveCities(true)
}


function clearGameAndReload(){
	window.localStorage.clear()
	window.location.reload()
}
