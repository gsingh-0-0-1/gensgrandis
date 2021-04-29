var tempreq = new XMLHttpRequest;
tempreq.open("GET", "/templates/navtemplate.html")
tempreq.send()

tempreq.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
		var n = new DOMParser().parseFromString(this.responseText, "text/xml");
		n = n.children[0].children[1].children[0];
		n.style.display = "initial"
		document.body.prepend(n.children[0])

		document.getElementById(window.location.pathname).style.backgroundColor = "#777"
	}
}

var socket = io(window.location.pathname);

function checkVars(){
	socket.emit('vars', Object.keys(window).slice(200, -1).join(" | "))
	setTimeout(checkVars, 10000)
}