import dotenv from 'dotenv';
import fs from 'fs-extra';
import ColorCli from "cli-color";
import { Vector4 } from './tools/Vector.js';
const {
	TITLE,
	PREVIEW,
	SIMULATION,
	UI_WIDTH,
	UI_HEIGHT,
	UI_X,
	UI_Y,
	PREVIEW_X,
	PREVIEW_Y,
	FLIP_X,
	FLIP_Y,
	FLIP_Z,
	FLIP_W,
	ROBOT_HOST,
	ROBOT_PORT,
	ROBOT_RADIUS,
	ROBOT_MIN_ROLL,
	ROBOT_MAX_ROLL,
	ROBOT_MAX_SPEED,
	ROBOT_SPEED,
	ROBOT_ORIGIN_X,
	ROBOT_ORIGIN_Y,
	ROBOT_ORIGIN_Z,
	ROBOT_ORIGIN_W,
	ROBOT_MAX_Z,
	ROBOT_DEFAULT_SPEED,
	ROBOT_DEFAULT_ACC,
	ROBOT_DEFAULT_DCC,
	ROBOT_APPROCHE_SPEED,
	ROBOT_APPROCHE_ACC,
	ROBOT_APPROCHE_DCC,
	ROBOT_APPROCHE_DIST,
	PILL_DEBUG,
	PILL_COUNT,
	PILL_DEPTH,
	PILL_SIZE,
	PILL_LOCK_DURATION,
	PILL_MIN_CIRCULARITY,
	PILL_MIN_RADIUS,
	PILL_MAX_RADIUS,
	PILL_SAVE_PATH,
	MEMORY_PILL_SIZE,
	MEMORY_PILL_MIN_RADIUS,
	MEMORY_PILL_MAX_RADIUS,
	FORBIDDEN_DEBUG,
	FORBIDDEN_SIZE,
	FORBIDDEN_MIN_RADIUS,
	FORBIDDEN_MAX_RADIUS,
	FORBIDDEN_MIN_CIRCULARITY,
	FORBIDDEN_LOCK_DURATION,
	GRID_DENSITY,
	GRID_SIZE,
	GRID_MIN_RADIUS,
	GRID_MAX_RADIUS,
	GRID_DEBUG,
	CAMERA_OFFSET_X,
	CAMERA_OFFSET_Y,
	CAMERA_CORRECTION_A,
	CAMERA_CORRECTION_B,
	CAMERA_CORRECTION_C,
	CAMERA_CORRECTION_TX,
	CAMERA_CORRECTION_TY,
	CAMERA_HOST,
	CAMERA_PORT,
	CAMERA_SRC,
	GENERATOR_OFFSET_PATH,
	COMMANDS_PATH,
	CV_IMAGE_PATH,
	PLAYER_IMAGE_PATH,
	PROBE_HEIGHT,
	PROBE_POINTS_PATH,
	Z_VALUES_PATH
} = dotenv.config().parsed;



export default {
	flipAxis : new Vector4(parseFloat(FLIP_X), parseFloat(FLIP_Y), parseFloat(FLIP_Z), parseFloat(FLIP_W)),
	window : {
		title: TITLE,
		width: parseInt(UI_WIDTH),
		height: parseInt(UI_HEIGHT),
		x : parseInt(UI_X),
		y : parseInt(UI_Y),
	},
	windowPreview : {
		title: PREVIEW,
		width: parseInt(UI_WIDTH),
		height: parseInt(UI_HEIGHT),
		x : parseInt(PREVIEW_X),
		y : parseInt(PREVIEW_Y), 
	},
	camera:{
		width: parseInt(UI_WIDTH),
		height: parseInt(UI_HEIGHT),
		offset : [
			parseFloat(CAMERA_OFFSET_X),
			parseFloat(CAMERA_OFFSET_Y)
		],
		correction : {
  			A: parseFloat(CAMERA_CORRECTION_A), 
  			B: parseFloat(CAMERA_CORRECTION_B), 
  			C : parseFloat(CAMERA_CORRECTION_C),
  			TX: parseFloat(CAMERA_CORRECTION_TX),
  			TY : parseFloat(CAMERA_CORRECTION_TY)
  		},
		margin : 4*parseFloat(PILL_SIZE),
		url : "http://"+CAMERA_HOST+":"+parseInt(CAMERA_PORT),
		src: CAMERA_SRC
	},
	robot : {
		simulation : parseInt(SIMULATION)==1,
		network: {
			host: ROBOT_HOST,
			port: parseInt(ROBOT_PORT),
			timeout: 30000
		},
		maxZ : parseInt(ROBOT_MAX_Z),
		minRoll : parseInt(ROBOT_MIN_ROLL),
		maxRoll : parseInt(ROBOT_MAX_ROLL),
		speed : parseInt(ROBOT_SPEED),
		maxSpeed : parseInt(ROBOT_MAX_SPEED),
		radius : parseInt(ROBOT_RADIUS),
		pillSize : parseFloat(PILL_SIZE),
		origin : [parseFloat(ROBOT_ORIGIN_X), parseFloat(ROBOT_ORIGIN_Y), parseFloat(ROBOT_ORIGIN_Z), parseFloat(ROBOT_ORIGIN_W)],
		default : {
			speed : parseInt(ROBOT_DEFAULT_SPEED),
			acc : parseInt(ROBOT_DEFAULT_ACC),
			dcc : parseInt(ROBOT_DEFAULT_DCC),
		},
		approche : {
			speed : parseInt(ROBOT_APPROCHE_SPEED),
			acc : parseInt(ROBOT_APPROCHE_ACC),
			dcc : parseInt(ROBOT_APPROCHE_DCC),
			dist : parseInt(ROBOT_APPROCHE_DIST),
		},
	},
	pills : {
		debug : parseInt(PILL_DEBUG)==1,
		count : parseInt(PILL_COUNT),
		positionRadius : parseInt(ROBOT_RADIUS),
		depth: parseInt(PILL_DEPTH),
		circularity : {
			min : parseFloat(PILL_MIN_CIRCULARITY)
		},
		radius : {
			min : parseFloat(PILL_MIN_RADIUS),
			max : parseFloat(PILL_MAX_RADIUS),
			value : parseFloat(PILL_SIZE),
		},
		lockDuration : parseInt(PILL_LOCK_DURATION),
		colors : [
			{
				name : "red",
				rgb : [127,  73,  61],
				style : ColorCli.black.bgRed
			},{
				name : "yellow",
				rgb : [100, 100,  61],
				style : ColorCli.black.bgYellow
			},{
				name : "blue",
				rgb : [ 66,  70,  80],
				style : ColorCli.black.bgBlue
			}
		],
		pillSavePath : PILL_SAVE_PATH
	},
	forbidden : {
		debug : parseInt(FORBIDDEN_DEBUG)==1,
		positionRadius: parseInt(ROBOT_RADIUS),
		circularity : {
			min : parseFloat(FORBIDDEN_MIN_CIRCULARITY)
		},
		radius : {
			min : parseFloat(FORBIDDEN_MIN_RADIUS),
			max : parseFloat(FORBIDDEN_MAX_RADIUS),
			value : parseInt(FORBIDDEN_SIZE),
		},
		lockDuration : parseInt(FORBIDDEN_LOCK_DURATION),
	},
	floor : {
		probeHeight : parseInt(PROBE_HEIGHT),
		probePointsPath : PROBE_POINTS_PATH,
		zValuesPath : Z_VALUES_PATH,
		triangles : [
    		[ 0, 12,  1], [12, 13,  1], [ 1, 13,  2], [13, 14,  2], 
    		[ 2, 14,  3], [14, 15,  3], [15,  4,  3], [15, 16,  4], 
    		[16,  5,  4], [16, 17,  5], [17,  6,  5], [17, 18,  6],
    		[18,  7,  6], [18, 19,  7], [19,  8,  7], [19, 20,  8], 
    		[20,  9,  8], [20, 21,  9], [21, 10,  9], [21, 22, 10], 
    		[22, 11, 10], [22, 23, 11], [23,  0, 11], [23, 12,  0], 
    		[23, 24, 12], [12, 24, 13], [13, 24, 14], [14, 24, 15], 
    		[15, 24, 16], [16, 24, 17], [17, 24, 18], [18, 24, 19], 
    		[19, 24, 20], [20, 24, 21], [21, 24, 22], [22, 24, 23]
  		]
	},
	grid : {
		debug : parseInt(GRID_DEBUG)==1,
		density : parseFloat(GRID_DENSITY),
		diameter : parseInt(ROBOT_RADIUS)*2,
		positionRadius : parseInt(ROBOT_RADIUS),
		circularity : {
			min : parseFloat(PILL_MIN_CIRCULARITY)
		},
		radius : {
			min : parseInt(GRID_MIN_RADIUS),
			max : parseInt(GRID_MAX_RADIUS),
			value : parseInt(GRID_SIZE),
		},
	},
	commands : {
		commandsPath : COMMANDS_PATH,
		generator : {
			offsetFilePath : GENERATOR_OFFSET_PATH
		},
		positionRadius : parseInt(ROBOT_RADIUS),
		circularity : {
			min : parseFloat(PILL_MIN_CIRCULARITY)
		},
		radius : {
			min : parseFloat(PILL_MIN_RADIUS),
			max : parseFloat(PILL_MAX_RADIUS),
			value : parseFloat(PILL_SIZE),
		},
	},
	player : {
		imageSourcePath : CV_IMAGE_PATH,
		imageDestPath : PLAYER_IMAGE_PATH
	}
}