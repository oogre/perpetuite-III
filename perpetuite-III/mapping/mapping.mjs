#!/usr/bin/env zx

// ./mapping.mjs -i ./../data/camera.jpg -n ./../data/empty.jpg -t ./../data/data.json -o ./../data/rectified2.png
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const TAG_DATA_FILE = argv.tag || argv.t;
const IMG_INPUT_FILE = argv.input || argv.i;
const IMG_EMPTY_FILE = argv.null || argv.n;
const IMG_OUTPUT_FILE = argv.output || argv.o;
const RULES = !!(argv.rules || argv.r);

const maskPath = "./../data/mask.png";
const composedPath = "./../data/compose.jpg";

const ROTATION = 0;
const SIZE = 1705;
const X_CORRECTION = 15;
const Y_CORRECTION = 0;

const getImageSize = async (path) => {
	const w = parseInt((await $`convert ${path} -print "%w" /dev/null`).stdout);
	const h = parseInt((await $`convert ${path} -print "%h" /dev/null`).stdout);
	return [w, h];
}

const [width, height] = await getImageSize(IMG_INPUT_FILE);
const TAGS = await fs.readJson(TAG_DATA_FILE);
const topLeft = TAGS.find(({id}) => id == 0).topLeft;
const bottomLeft = TAGS.find(({id}) => id == 1).bottomLeft;
const bottomRight = TAGS.find(({id}) => id == 2).bottomRight;
const topRight = TAGS.find(({id}) => id == 3).topRight;

const ruleCmd = (x, y, w, h) => {
	return	RULES ? 
				`\\( -stroke red -draw "line 0,${y} ${w},${y}" \\) \
				 \\( -stroke red -fill none -draw "circle ${x},${y} ${x+h/2} ${y}" \\) \
				 \\( -stroke red -draw "line ${x},0 ${x},${h}" \\)`
			: 
				``;
}

const genMaskCmd = (x, y, size, filePath) => {
	return `convert -size ${size}x${size} xc:Black -fill White -draw 'circle ${x} ${y} ${size/2} 1' -alpha Copy ${filePath};`;
}

const maskCmd = (maskPath) => {
	return `-gravity Center ${maskPath} -compose CopyOpacity -composite -trim`
}

const perspectiveCmd = ([x1, y1], [x2, y2], [x3, y3], [x4, y4], centerX, centerY, offX, offY) => {
	const _mX = centerX - offX;
	const _MX = centerX + offX;
	const _mY = centerY - offY;
	const _MY = centerY + offY;
	const [_x1, _y1] = [_mX, _mY];
	const [_x2, _y2] = [_mX, _MY];
	const [_x3, _y3] = [_MX, _MY];
	const [_x4, _y4] = [_MX, _mY];
	const coord = `${x1},${y1} ${_x1},${_y1} \
	               ${x2},${y2} ${_x2},${_y2} \
	               ${x3},${y3} ${_x3},${_y3} \
	               ${x4},${y4} ${_x4},${_y4}`;

	return `\\( -matte -verbose -virtual-pixel transparent -distort Perspective "${coord}" \\)`;
}

const cropCmd = (x, y, size) => {
	return `\\( -crop "${size}x${size}+${x-size/2}+${y-size/2}" \\)`;
}

const rotationCmd = (angle) => {
	return `\\( -virtual-pixel black -distort SRT "${angle}" \\)`;
}

const genDiffCmd = (path) => {
	return `convert ${IMG_EMPTY_FILE} ${IMG_INPUT_FILE} -compose difference -composite ${path};`;
}

const main = () => {
	
	return `\
		${ genMaskCmd(height/2, height/2, height, maskPath) } \
		${ genDiffCmd(composedPath) } \
		convert ${composedPath} \
		${ perspectiveCmd(topLeft, bottomLeft, bottomRight, topRight, width/2, height/2, SIZE/2 + X_CORRECTION, SIZE/2 + Y_CORRECTION) } \
		${ rotationCmd(ROTATION) } \
		${ ruleCmd(width /2, height/2, width, height) } \
		${ cropCmd(width/2,height/2, height) } \
		${ maskCmd(maskPath) } \
		${IMG_OUTPUT_FILE} \
	`;
}

await exec(main());
