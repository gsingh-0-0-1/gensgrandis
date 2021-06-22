/* Copyright (C) Gurmehar Singh 2021 - All Rights Reserved
/* Unauthorized distribution of this file, via any medium is strictly prohibited
/* Proprietary and confidential
/* Written by Gurmehar Singh <gurmehar@gmail.com>
*/

function gammaCompare(a, b){
	var sum = a + b
	var g1 = math.gamma(a + 1)
	var g2 = math.gamma(b + 1)
	var nsum = g1 + g2
	var odds1 = g1 / nsum
	var odds2 = g2 / nsum
	return [odds1, odds2]
}

function appendCombatBonusString(ucode, text){
	//add text to desired unit text, add newline to other unit
	document.getElementById("combat_u" + ucode + "_stats").innerHTML += "<br>" + text
	if (ucode == 1){
		var ocode = 2
	}
	else{
		var ocode = 1
	}
	document.getElementById("combat_u" + ocode + "_stats").innerHTML += "<br>"
}

function getModifiedStrengths(att, ax, ay, def, dx, dy){
	var h_a = getTileAt(ax, ay).height
	var h_d = getTileAt(dx, dy).height

	var h_bonus = (h_a - h_d) * 0.75
	h_bonus = Math.round(h_bonus * 100) / 100

	//add the modified bonus for being on the high ground to the correct unit
	if (h_bonus < 0){
		def = def + Math.abs(h_bonus)
		appendCombatBonusString(2, "+" + Math.abs(h_bonus) + " (High Ground)")
	}
	if (h_bonus > 0){
		att = att + Math.abs(h_bonus)
		appendCombatBonusString(1, "+" + Math.abs(h_bonus) + " (High Ground)")
	}

	return [att, def]
}


function unitCombat(id, x, y, show = true){
	var firstunit = unitlist[id]
	var secondunit = unitlist[getTileAt(x, y).hasUnit_ID]
	if (firstunit.owner === secondunit.owner){
		return
	}

	if (unit_strengths[firstunit.type] == undefined || unit_strengths[firstunit.type] == null){
		return
	}
	if (unit_strengths[secondunit.type] == undefined || unit_strengths[secondunit.type] == null){
		return
	}

	if (show){
		document.getElementById("combat_u1_u").innerHTML = unit_corresponds[firstunit.type] + " (You)"
		document.getElementById("combat_u2_u").innerHTML = unit_corresponds[secondunit.type] + " (" + secondunit.owner + ")"
	}

	var u1str = unit_strengths[firstunit.type] - unitlist[firstunit.unitid].damage
	var u2str = unit_strengths[secondunit.type] - unitlist[secondunit.unitid].damage

	if (show){		
		document.getElementById("combat_u1_stats").innerHTML = "Strength: " + u1str
		document.getElementById("combat_u2_stats").innerHTML = "Strength: " + u2str
	}

	var m_strengths = getModifiedStrengths(u1str, firstunit.x, firstunit.y, u2str, secondunit.x, secondunit.y)
	var u1_m_str = m_strengths[0]
	var u2_m_str = m_strengths[1]

	var odds = gammaCompare(u1_m_str, u2_m_str)
	var u1odds = (Math.round(odds[0] * 10000) / 100)
	var u2odds = (Math.round(odds[1] * 10000) / 100)

	if (show){
		document.getElementById("combat_u1_odds").innerHTML = "Win Odds: " + u1odds + "%"
		document.getElementById("combat_u2_odds").innerHTML = "Win Odds: " + u2odds + "%"
	}

	document.getElementById("combat_u1_details").innerHTML = u1odds + "," + firstunit.unitid
	document.getElementById("combat_u2_details").innerHTML = u2odds + "," + secondunit.unitid

	document.getElementById("combat_u1_odds").innerHTML += "<br>"
	document.getElementById("combat_u2_odds").innerHTML += "<br>"

	if (show){
		showCustomAlert("combat_alert")
	}
}

function declareWinner(ucode, id_remove){
	if (ucode == 1){
		showCustomAlert("you_win_combat")
		removeUnit(id_remove)
	}
	if (ucode == 2){
		showCustomAlert("you_lose_combat")
		removeUnit(id_remove)
	}
}

function damageUnit(id, amt){
	unitlist[id].damage = amt
}

function getDamage(odds, s){
	var d = odds / 100
	d = 1 - d
	d = d * s
	return Math.round(d * 100) / 100
}

function commenceCombat(){
	var u1 = document.getElementById("combat_u1_details").textContent
	var u2 = document.getElementById("combat_u2_details").textContent

	var u1odds = u1.split(",")[0] * 1
	var u1id = u1.split(",")[1] * 1
	var u1str = unit_strengths[unitlist[u1id].type] - unitlist[u1id].damage

	var u2odds = u2.split(",")[0] * 1
	var u2id = u2.split(",")[1] * 1
	var u2str = unit_strengths[unitlist[u2id].type] - unitlist[u2id].damage

	var outcome = Math.random() * 100

	if (outcome > u2odds){
		declareWinner(1, u2id)
		damageUnit(u1id, getDamage(u1odds, u1str))
	}
	else{
		declareWinner(2, u1id)
		damageUnit(u2id, getDamage(u2odds, u2str))
	}
}
