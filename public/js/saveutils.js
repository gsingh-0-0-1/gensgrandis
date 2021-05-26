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
				alert("all terrain loaded")
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

function saveCities(){
	var c_obj = {}
	for (var city of cities){
		c_obj[city.name] = {}
		c_obj[city.name].center = {}
		c_obj[city.name].center.x = city.center.x
		c_obj[city.name].center.y = city.center.y
		c_obj[city.name].center.population = city.center.population
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
	return c_obj
}


function saveGameData(){
	saveExploredTiles()
	saveUnits()
}

