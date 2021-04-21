#* Copyright (C) Gurmehar Singh 2020 - All Rights Reserved
#* Unauthorized copying or distribution of this file, via any medium is strictly prohibited
#* Proprietary and confidential
#* Written by Gurmehar Singh <gurmehar@gmail.com>
#*/


import numpy as np
import random
import sqlite3
import os
import sys
import cv2

print("Starting")

SAVES_LISTING = [el for el in os.listdir("saves/") if "map" in el]
fname = "map" + str(len(SAVES_LISTING) + 1)

print("Generating " + fname + "...")

os.mkdir("saves/" + fname + "/")

'''
CONSTANTS AND INITIALIZATION ######################################################################
'''

MAX_WORLD_RADIUS = 500

CENTER_X = 550
CENTER_Y = 555

try:
	if sys.argv[1].isnumeric():
		WORLD_SEED = int(sys.argv[1])
except IndexError:
	WORLD_SEED = round(random.uniform(1, 10) * 10**10)

TOP_LEVEL_GENERATOR = np.random.default_rng(WORLD_SEED)


#Some useful functions to help create seeds and such
def getUsableSeed(gen):
	return round(gen.random() * 10**10)

def createCoordPairs(gen, num, radius = MAX_WORLD_RADIUS):
	return gen.integers(0, radius * 2, (num, 2))

def extractCoords(coords1, coords2):
	return coords1[0], coords1[1], coords2[0], coords2[1]

def createStructureGen(x, y, seed):
	return np.random.default_rng(seed*x + y)


LAND_TILE_CODE = 'l'

FOREST_START_TILE_CODE = 's,l,f'
FOREST_TILE_CODE = 'l,f'

MOUNTAIN_START_TILE_CODE = 's,l,m'
MOUNTAIN_TILE_CODE = 'l,m'

WATER_BODY_START_TILE_CODE = 's,w,l,n'
WATER_BODY_TILE_CODE = 'w,l,n'

RIVER_START_TILE_CODE = 's,w,l,r'
RIVER_TILE_CODE = 'w,r'

DESERT_TILE_CODE = 'l,d'
DESERT_SIZE = 15
DESERT_SIZE_VAR = 3
DESERT_NUM = 4

INFO_DELIMITER = "|"
HEIGHT_DELIMITER = "#"

WATER_BODY_GENERATOR = np.random.default_rng(getUsableSeed(TOP_LEVEL_GENERATOR))
RIVER_GENERATOR = np.random.default_rng(getUsableSeed(TOP_LEVEL_GENERATOR))
FOREST_GENERATOR = np.random.default_rng(getUsableSeed(TOP_LEVEL_GENERATOR))
MOUNTAIN_GENERATOR = np.random.default_rng(getUsableSeed(TOP_LEVEL_GENERATOR))
DESERT_GENERATOR = np.random.default_rng(getUsableSeed(TOP_LEVEL_GENERATOR))

WATER_BODY_SEED = getUsableSeed(WATER_BODY_GENERATOR)
RIVER_SEED = getUsableSeed(RIVER_GENERATOR)
FOREST_SEED = getUsableSeed(FOREST_GENERATOR)
MOUNTAIN_SEED = getUsableSeed(MOUNTAIN_GENERATOR)
DESERT_SEED = getUsableSeed(DESERT_GENERATOR)

WATER_BODY_AREA_PER = 400
WATER_BODIES_NUM = round((2 * MAX_WORLD_RADIUS)**2 / WATER_BODY_AREA_PER)
WATER_ITERATIONS = 2
WATER_BODY_DIAMETER = WATER_ITERATIONS * 2 + 1
WATER_BODY_TILES_PER = (2 * WATER_ITERATIONS + 1) ** 2
WATER_BODY_CENTER_IDX = int(WATER_BODY_TILES_PER / 2)

RIVER_DIV = 15
INIT_RIVER_DIR_CHANGE_MAX = 1/10
RIVER_BASE_LENGTH = 180
RIVER_LEN_VAR = 30
RIVER_WIDTHS = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3]
COMP_RIVER_TILE_CODE = "0" + HEIGHT_DELIMITER + RIVER_TILE_CODE + INFO_DELIMITER

FOREST_NUM = WATER_BODIES_NUM * 3
FOREST_MOVEMENTS = [-1, 0, 1]
FOREST_SIZE = 15
FOREST_DENSITY = 4
FOREST_DENS_MOD_LIMIT = 2

MOUNTAIN_NUM = round(WATER_BODIES_NUM * 0.5)
MOUNTAIN_BASE_DIAMETER_LIST = [13]
MOUNTAIN_DIAM_VAR = 5
MOUNTAIN_HEIGHT_VAR_MAX = 0.05
MINCOLORMTN = 51

MOUNTAIN_STONE_HEIGHT = 5

BASE_TILE_HEIGHT = 0.2


'''
GENERATION FUNCTIONS ##############################################################################
'''

def getMountainHeight(x, y, d):
	#z = (d/2) * 1.2**(-10/d * (x-d/2)**2) * 1.2**(-10/d * (y-d/2)**2)
	#z = 1.35 * (z ** (1/2))
	z = (d / 7) * (( ( np.sin((2 * np.pi * x / d) - (np.pi / 2)) + 1 ) * ( np.sin((2 * np.pi * y / d) - (np.pi / 2)) + 1 ) ) ** (1 / 2))
	return z

def checkValidTile(x, y):
	if x >= 2*MAX_WORLD_RADIUS or y >= 2*MAX_WORLD_RADIUS:
		return False
	if x < 0 or y < 0:
		return False
	else:
		return True

def tileInBounds(target, coords1, coords2):
	x1, y1, x2, y2 = extractCoords(coords1, coords2)
	if x1 <= target[0] <= x2 and y1 <= target[1] <= y2:
		return True
	return False

def isTileWater(tile):
	if tile == WATER_BODY_TILE_CODE or tile == WATER_BODY_START_TILE_CODE or tile == RIVER_TILE_CODE or tile == RIVER_START_TILE_CODE:
		return True
	return False

def isTileAdjacentToWater(x, y):
	if checkValidTile(x, y + 1):
		if isTileWater(GAME_GRID[y + 1][x].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]):
			return True
	if checkValidTile(x, y - 1):
		if isTileWater(GAME_GRID[y - 1][x].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]):
			return True
	if checkValidTile(x + 1, y):
		if isTileWater(GAME_GRID[y][x + 1].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]):
			return True
	if checkValidTile(x - 1, y):
		if isTileWater(GAME_GRID[y][x - 1].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]):
			return True
	return False
	

def generateWaterBodies(coords1, coords2, water_locations, seed = WATER_BODY_SEED):
	x1, y1, x2, y2 = extractCoords(coords1, coords2)
	current_terrain = GAME_GRID[y1 : y2, x1 : x2]

	#go through the water bodies and fully generate them
	for pair in water_locations:
		if tileInBounds(pair, coords1, coords2):
			pass
		else:
			continue

		body_x = pair[0]
		body_y = pair[1]

		#make sure a water body doesn't generate on or near the center
		#if (abs(body_x - CENTER_X) < WATER_ITERATIONS + 1 and abs(body_y - CENTER_Y) < WATER_ITERATIONS + 1):
		#	#GAME_GRID[tile_y][tile_x] = str(BASE_TILE_HEIGHT) + HEIGHT_DELIMITER + LAND_TILE_CODE + INFO_DELIMITER
		#	waterbody_coords.remove([tile_y, tile_x])
		#	continue

		#GAME_GRID[body_y - 2 : body_y + 2, body_x - 2 : body_x + 2] = "0" + HEIGHT_DELIMITER + WATER_BODY_TILE_CODE + INFO_DELIMITER
		#GAME_GRID[body_y][body_x] = "0" + HEIGHT_DELIMITER + WATER_BODY_START_TILE_CODE + INFO_DELIMITER
		#IMG_ARRAY[body_y - 2 : body_y + 2, body_x - 2 : body_x + 2] = [77, 77, 179]
		#for body_x in water_locations[1]:
		#create the generator for the individual water body
		this_body_generator = createStructureGen(body_x, body_y, seed)
		#set up the probabilities
		chances = this_body_generator.random((WATER_BODY_TILES_PER))
		for tileidx in range(WATER_BODY_TILES_PER):
			#check if this is the center tile
			if tileidx == WATER_BODY_CENTER_IDX:
				continue

			#check if the tile should be made into water
			x = int(tileidx / WATER_BODY_DIAMETER)
			y = (tileidx % WATER_BODY_DIAMETER)
			#check distance from center to get minimum chance
			s = max(abs(WATER_ITERATIONS - x), abs(WATER_ITERATIONS - y))
			if s == 0:
				print(x, y, tileidx, WATER_BODY_CENTER_IDX)
			chance = 1/(s+1)
			if chances[tileidx] < chance:
				tile_y = body_y + y - WATER_ITERATIONS# + y1
				tile_x = body_x + x - WATER_ITERATIONS# + x1
				if not checkValidTile(tile_x, tile_y):
					continue

				GAME_GRID[tile_y][tile_x] = "0" + HEIGHT_DELIMITER + WATER_BODY_TILE_CODE + INFO_DELIMITER
				IMG_ARRAY[tile_y][tile_x] = [77, 77, 179]


def generateForests(coords1, coords2, forest_locations, seed = FOREST_SEED):
	x1, y1, x2, y2 = extractCoords(coords1, coords2)
	current_terrain = GAME_GRID[y1 : y2, x1 : x2]

	#forest_locations = np.where(np.char.find(np.array(current_terrain, dtype=str), FOREST_START_TILE_CODE) >= 0)

	for pair in forest_locations:
		forest_x = pair[0]
		forest_y = pair[1]
		if tileInBounds(pair, coords1, coords2):
			pass
		else:
			continue

		this_forest_generator = createStructureGen(forest_x, forest_y, seed)

		for run in range(FOREST_DENSITY):
			starting_x = forest_x
			starting_y = forest_y

			cur_x = starting_x
			cur_y = starting_y

			for walk in range(FOREST_SIZE):
				cur_x += this_forest_generator.integers(-1, 1, endpoint=True)
				cur_y += this_forest_generator.integers(-1, 1, endpoint=True)
				tile_x = cur_x# + x1
				tile_y = cur_y# + y1
				#print(tile_x, tile_y)
				if checkValidTile(tile_x, tile_y):
					#print(tile_x, tile_y)
					#make some forest tiles more "dense"
					#print(GAME_GRID[tile_y][tile_x])
					#info = GAME_GRID[tile_y][tile_x].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)
					#if isTileWater(info[0]):
					#	continue
					#if info[1] == '':
					#	tiledensmod = 1
					#else:
					#	tiledensmod = int(info[1])

					#check if already is forest
					#curcode = info[0]
					#if curcode == FOREST_TILE_CODE or curcode == FOREST_START_TILE_CODE:
					#	tiledensmod += 1
					#	if tiledensmod > FOREST_DENS_MOD_LIMIT:
					#		tiledensmod = FOREST_DENS_MOD_LIMIT

					tile_height = GAME_GRID[tile_y][tile_x].split(HEIGHT_DELIMITER)[0]

					if (float(tile_height) < BASE_TILE_HEIGHT):
						tile_height = str(BASE_TILE_HEIGHT)

					GAME_GRID[tile_y][tile_x] = tile_height + HEIGHT_DELIMITER + FOREST_TILE_CODE + INFO_DELIMITER + "1"

					IMG_ARRAY[tile_y][tile_x] = [25, 127, 25]

def generateDeserts(desert_locations, seed = DESERT_SEED):
	for pair in desert_locations:
		desert_x = pair[0]
		desert_y = pair[1]

		this_desert_generator = createStructureGen(desert_x, desert_y, seed)

		xfactor = this_desert_generator.integers(1, 7)
		yfactor = 7 - xfactor
		#this creates a "circular" set of coordinates for the desert, but the bounding circle is modified by sine waves
		#mask = [[x, y] for x in range(desert_x - DESERT_SIZE, desert_x + DESERT_SIZE + 1) for y in range(desert_y - DESERT_SIZE, desert_y + DESERT_SIZE + 1) if (((x - desert_x + this_desert_generator.choice([-2, -1, 1, 2]))**2 * (xfactor)) + ((y - desert_y + this_desert_generator.choice([-2, -1, 1, 2]))**2 * yfactor) < (DESERT_SIZE)**2 )]

		mask = []

		thetas = np.arange(0, 6.3, 0.01)

		for theta in thetas:
			max_r = this_desert_generator.integers(DESERT_SIZE - DESERT_SIZE_VAR, DESERT_SIZE + DESERT_SIZE_VAR)
			for r in range(max_r):
				tx = r * np.cos(theta)
				ty = r * np.sin(theta)
				mask.append([int(tx + desert_x), int(ty + desert_y)])

		for el in mask:
			tile_x = el[0]
			tile_y = el[1]
			if checkValidTile(tile_x, tile_y):
				curtile = GAME_GRID[tile_y][tile_x].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]
				if not isTileWater(curtile) and not isTileAdjacentToWater(tile_x, tile_y):
					tile_height = GAME_GRID[tile_y][tile_x].split(HEIGHT_DELIMITER)[0]

					if (float(tile_height) < BASE_TILE_HEIGHT):
						tile_height = str(BASE_TILE_HEIGHT)

					GAME_GRID[tile_y][tile_x] = tile_height + HEIGHT_DELIMITER + DESERT_TILE_CODE

					if float(tile_height) >= 1 and float(tile_height) <= 5:
						IMG_ARRAY[tile_y][tile_x] = [160, 82, 45]
					if float(tile_height) > 5:
						IMG_ARRAY[tile_y][tile_x] = [230, 224, 224]
					if float(tile_height) < 1:
						IMG_ARRAY[tile_y][tile_x] = [230, 217, 0]

def generateMountains(coords1, coords2, mountain_locations, seed = MOUNTAIN_SEED):
	x1, y1, x2, y2 = extractCoords(coords1, coords2)
	current_terrain = GAME_GRID[y1 : y2, x1 : x2]

	for pair in mountain_locations:
		if tileInBounds(pair, coords1, coords2):
			pass
		else:
			continue

		start_x = mountain_x = pair[0]
		start_y = mountain_y = pair[1]

		this_mountain_generator = createStructureGen(mountain_x, mountain_y, seed)

		#this_mountain_diameter = MOUNTAIN_BASE_DIAMETER + this_mountain_generator.integers(-MOUNTAIN_DIAM_VAR, MOUNTAIN_DIAM_VAR)

		this_mountain_diameter = round(this_mountain_generator.normal(this_mountain_generator.choice(MOUNTAIN_BASE_DIAMETER_LIST), MOUNTAIN_DIAM_VAR))

		for cur_y in range(start_y, start_y + this_mountain_diameter):
			for cur_x in range(start_x, start_x + this_mountain_diameter):
				rel_y = cur_y - start_y
				rel_x = cur_x - start_x

				tileheight = getMountainHeight(rel_x, rel_y, this_mountain_diameter)
				tileheight += (this_mountain_generator.random() - 0.5) * MOUNTAIN_HEIGHT_VAR_MAX

				if checkValidTile(cur_x, cur_y):
					curtile = GAME_GRID[cur_y][cur_x].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]
					if not isTileWater(curtile):
						tileheight = float(tileheight) + float(GAME_GRID[cur_y][cur_x].split(HEIGHT_DELIMITER)[0])
						tileheight = round(tileheight, 2)
						GAME_GRID[cur_y][cur_x] = str(tileheight) + HEIGHT_DELIMITER + GAME_GRID[cur_y][cur_x].split(HEIGHT_DELIMITER)[1]

						mod_c = False
						if tileheight > 1:
							mod_c = True

							c = IMG_ARRAY[cur_y][cur_x]

							if tileheight >= 5:
								c = [127, 127, 127]

								if tileheight >= 8:
									c = [230, 224, 224]

							if tileheight < 5:
								for it in range(int(tileheight - 2)):
									c[0] = c[0] + (MINCOLORMTN - c[0]) / 2
									c[1] = c[1] + (MINCOLORMTN - c[1]) / 2
									c[2] = c[2] + (MINCOLORMTN - c[2]) / 2

						if mod_c:
							IMG_ARRAY[cur_y][cur_x] = c




def generateRivers(coords1, coords2, river_locations, seed = RIVER_SEED):
	x1, y1, x2, y2 = extractCoords(coords1, coords2)

	for pair in river_locations:
		if tileInBounds(pair, coords1, coords2):
			pass
		else:
			continue
		start_x = river_x = pair[0]
		start_y = river_y = pair[1]

		this_river_generator = createStructureGen(river_x, river_y, seed)

		xchance = this_river_generator.random()

		while xchance < 0.25 or xchance > 0.75:
			xchance = this_river_generator.random()

		xmod = this_river_generator.choice([1, -1])
		ymod = this_river_generator.choice([1, -1])

		this_river_width = this_river_generator.choice(RIVER_WIDTHS)

		this_river_dir_change_max = INIT_RIVER_DIR_CHANGE_MAX
		this_river_length = RIVER_BASE_LENGTH + this_river_generator.integers(-RIVER_LEN_VAR, RIVER_LEN_VAR)

		cur_x = start_x
		cur_y = start_y
		cur_size = 1

		while cur_size < this_river_length:
			r = this_river_generator.random()

			if r < xchance:
				movedir = np.array([xmod, 0])
			else:
				movedir = np.array([0, ymod])

			cur_x += movedir[0]
			cur_y += movedir[1]

			if checkValidTile(cur_x, cur_y):
				GAME_GRID[cur_y][cur_x] = COMP_RIVER_TILE_CODE
				IMG_ARRAY[cur_y][cur_x] = [77, 77, 179]

			w_cur_x = cur_x
			w_cur_y = cur_y
			for w in range(this_river_width - 1):
				w_cur_x += movedir[1]
				w_cur_y += movedir[0]
				if checkValidTile(w_cur_x, w_cur_y):
					GAME_GRID[w_cur_y][w_cur_x] = COMP_RIVER_TILE_CODE
					IMG_ARRAY[w_cur_y][w_cur_x] = [77, 77, 179]

			xchance += (this_river_generator.random() - 0.5) * this_river_dir_change_max
			cur_size += 1

			#as the river "ends", make the width smaller and cause more variance in direction
			if this_river_length - cur_size == 10 or this_river_length - cur_size == 5:
				this_river_width -= 1
				if this_river_width <= 0:
					this_river_width = 1
				this_river_dir_change_max *= 2


IMG_ARRAY = np.full((1000, 1000, 3), [51, 153, 51], dtype=np.float32)

'''
BEGIN GENERATION ##################################################################################
'''
GAME_GRID = np.full((MAX_WORLD_RADIUS * 2, MAX_WORLD_RADIUS * 2), str(BASE_TILE_HEIGHT) + HEIGHT_DELIMITER + LAND_TILE_CODE + INFO_DELIMITER, dtype=object)



'''
INSERT FORESTS ####################################################################################
'''

forest_coords = createCoordPairs(FOREST_GENERATOR, FOREST_NUM)
GAME_GRID[forest_coords[:, 1], forest_coords[:, 0]] = str(BASE_TILE_HEIGHT) + HEIGHT_DELIMITER + FOREST_START_TILE_CODE + INFO_DELIMITER
IMG_ARRAY[forest_coords[:, 1], forest_coords[:, 0]] = [25, 151, 25]



'''
INSERT MOUNTAINS ##################################################################################
'''

mountain_coords = createCoordPairs(MOUNTAIN_GENERATOR, MOUNTAIN_NUM)
GAME_GRID[mountain_coords[:, 1], mountain_coords[:, 0]] = str(BASE_TILE_HEIGHT) + HEIGHT_DELIMITER + MOUNTAIN_START_TILE_CODE + INFO_DELIMITER
#IMG_ARRAY[mountain_coords[:, 0], mountain_coords[:, 1]] = [50, 50, 50]



'''
GENERATE WATER BODIES #############################################################################
'''

waterbody_coords = createCoordPairs(WATER_BODY_GENERATOR, WATER_BODIES_NUM)
GAME_GRID[waterbody_coords[:, 1], waterbody_coords[:, 0]] = '0' + HEIGHT_DELIMITER + WATER_BODY_START_TILE_CODE + INFO_DELIMITER
IMG_ARRAY[waterbody_coords[:, 1], waterbody_coords[:, 0]] = [77, 77, 179]



'''
INSERT RIVERS #####################################################################################
'''

river_coords = waterbody_coords[::RIVER_DIV]
GAME_GRID[river_coords[:, 1], river_coords[:, 0]] = '0' + HEIGHT_DELIMITER + RIVER_START_TILE_CODE + INFO_DELIMITER
IMG_ARRAY[river_coords[:, 1], river_coords[:, 0]] = [77, 77, 179]



'''
GENERATE DESERTS ##################################################################################
'''

desert_coords = createCoordPairs(DESERT_GENERATOR, DESERT_NUM)
desert_coords = list(desert_coords)

#add more "children deserts" surrounding the main one - these will merge to form more irregularly shaped deserts
for c in range(len(desert_coords)):
	thetas = [DESERT_GENERATOR.random() * 2 * np.pi for i in range(4)]
	rlist = [DESERT_GENERATOR.integers(int(DESERT_SIZE/2), int(7 * DESERT_SIZE / 8)) for i in range(4)]
	for r, theta in zip(rlist, thetas):
		targetx = int(desert_coords[c][0] + r * np.cos(theta))
		targety = int(desert_coords[c][1] + r * np.sin(theta))
		if not checkValidTile(targetx, targety):
			continue
		desert_coords.append([targetx, targety])

desert_coords = np.array(desert_coords)

GAME_GRID[desert_coords[:, 1], desert_coords[:, 0]] = str(BASE_TILE_HEIGHT) + HEIGHT_DELIMITER + DESERT_TILE_CODE + INFO_DELIMITER
IMG_ARRAY[desert_coords[:, 1], desert_coords[:, 0]] = [230, 217, 0]

'''
WRITE FILES #######################################################################################
'''

print("Base generation done")

f = open("saves/" + fname + "/seed.txt", "w")
f.write(str(WORLD_SEED))
f.close()

f = open("saves/" + fname + "/explored.txt", "w")
f.write(str(CENTER_X) +  "," + str(CENTER_Y))
f.close()

f = open("saves/" + fname + "/units.txt", "w")
#f.write("P~x:" + str(CENTER_X) + ",y:" + str(CENTER_Y) + ",n:100,m:5\n")
f.write("P~x:xhere,y:yhere,n:100,m:5\n")
f.close()

f = open("saves/" + fname + "/cities.txt", "w")
f.close()

np.savetxt('saves/' + fname + '/forestcoords.txt', forest_coords)
np.savetxt('saves/' + fname + '/mountaincoords.txt', mountain_coords)
np.savetxt('saves/' + fname + '/waterbodycoords.txt', waterbody_coords)
np.savetxt('saves/' + fname + '/rivercoords.txt', river_coords)
np.savetxt('saves/' + fname + '/desertcoords.txt', desert_coords)

print("Basic files saved")

conn = sqlite3.connect('saves/' + fname + '/world.db')

cur = conn.cursor()

command = ''' CREATE TABLE world (tilename varchar(50) PRIMARY KEY, tiledesc varchar(50) )'''

cur.execute(command)



for ycoord in range(0, MAX_WORLD_RADIUS * 2, 100):
	for xcoord in range(0, MAX_WORLD_RADIUS * 2, 100):
		pair1, pair2 = [xcoord, ycoord], [xcoord + 100, ycoord + 100]
		#print("w")
		generateWaterBodies(pair1, pair2, waterbody_coords)
		#print("f")
		generateForests(pair1, pair2, forest_coords)
		#print("r")
		generateRivers(pair1, pair2, river_coords)
		#print("m")
		generateMountains(pair1, pair2, mountain_coords)
		#for y in range(ycoord, ycoord + 100):
		#	for x in range(xcoord, xcoord + 100):
				#tile_info = GAME_GRID[y, x].split(HEIGHT_DELIMITER)
				#tile_desc = tile_info[1].split(INFO_DELIMITER)[0]
				#if not isTileWater(tile_desc):
				#	h = float(tile_info[0])
				#	if h < BASE_TILE_HEIGHT:
				#		h = BASE_TILE_HEIGHT
				#		GAME_GRID[y, x] = str(h) + HEIGHT_DELIMITER + tile_info[1]
		#		command = ''' INSERT INTO world (tilename, tiledesc) VALUES ("''' + str(x) + "_" + str(y) + '''",  "''' + GAME_GRID[y, x] + '''")'''
				#print(x, y, GAME_GRID[y, x])
		#		cur.execute(command)
		#conn.commit()
		#np.savetxt('saves/' + fname + '/chunk_' + str(xcoord) + "_" + str(ycoord) + ".txt", GAME_GRID[ycoord:ycoord+100, xcoord:xcoord+100], fmt="%s", delimiter=" ")
		print("Features done " + str(pair1))


generateDeserts(desert_coords)

print("Generating save data...")

for y in range(0, MAX_WORLD_RADIUS * 2):
	for x in range(0, MAX_WORLD_RADIUS * 2):
		command = ''' INSERT INTO world (tilename, tiledesc) VALUES ("''' + str(x) + "_" + str(y) + '''",  "''' + GAME_GRID[y, x] + '''")'''
		cur.execute(command)


#coords = ['"' + str(x) + "_" + str(y) + '"' for x in range(0, MAX_WORLD_RADIUS * 2) for y in range(0, MAX_WORLD_RADIUS * 2)]
#tiles = ['"' + GAME_GRID[y, x] + '"' for x in range(0, MAX_WORLD_RADIUS * 2) for y in range(0, MAX_WORLD_RADIUS * 2)]

#final = ",".join(["(" + str(x) + "," + str(y) + ")" for x, y in zip(coords, tiles)])

#command = ''' INSERT INTO world (tilename, tiledesc) VALUES ( "0_0", "0#l,f" )'''
#cur.execute(command)


conn.commit()

print("Map saved.")

spawnlocs = [[500, 500], [510, 500], [510, 510], [500, 510]]

for pair in spawnlocs:
	i = 1
	while isTileWater(GAME_GRID[pair[1]][pair[0]].split(HEIGHT_DELIMITER)[1].split(INFO_DELIMITER)[0]) or float(GAME_GRID[pair[1]][pair[0]].split(HEIGHT_DELIMITER)[0]) > MOUNTAIN_STONE_HEIGHT:
		pair[1] -= i
		pair[0] -= 1
		i += 1

f = open('saves/' + fname + "/spawnlocs.txt", "w")
for pair in spawnlocs:
	f.write(str(pair[0]) + "," + str(pair[1]) + "\n")

f.close()

print("Spawn locations generated.")

IMG_ARRAY = cv2.cvtColor(IMG_ARRAY, cv2.COLOR_BGR2RGB)
cv2.imwrite("saves/" + fname + "/img.png", IMG_ARRAY)


