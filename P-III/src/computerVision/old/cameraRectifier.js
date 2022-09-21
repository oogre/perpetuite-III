#!/usr/bin/env node
/*----------------------------------------*\
  perpetuite-III - cameraRectifier.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-08-23 11:21:12
  @Last Modified time: 2022-08-31 17:22:33
\*----------------------------------------*/
import fs from 'fs-extra';
import _conf_ from './../common/config.js';
import {Call} from './../common/CoreApiHelper.js';
import Command from './../common/CommandHelper.js';
import { stringToBoolean }  from './../common/tools.js';
import Vector from './../common/Vector.js';
const { 
	tag_file_path:tagFilePath,
	img_file_path:inImgFilePath,
	empty_img_file_path:emptyImgFilePath,
  diff_img_file_path:diffImgFilePath,
  mask_img_file_path:maskImgFilePath,
	rectified_img_file_path:outImgFilePath,
	projected_size:pSize,
	output_color_space:colorSpace,
	horizontal_scale_correction:xScaleCorr,
	vertical_scale_correction:yScaleCorr,
	Right,
  Left,
  Up,
  Down,
	horizontal_offset_correction:xOffCorr,
	vertical_offset_correction:yOffCorr
} = _conf_.CAMERA_CONF;

const { 
	physical:{
		table_radius:radius
	},
	zProbe:{
		probe_points:probePoints
	}
} = _conf_.HIGH_LEVEL_API_CONF;


const MM_TO_PIX = pSize / (450 * 2);

const getImageSize = async (path) => {
	const $ = Call();
	return await $(`convert ${path} -print "[%w,%h]" /dev/null`);
}

const perspectiveCmd = ([x1, y1], [x2, y2], [x3, y3], [x4, y4], centerX, centerY) => {
	const _mX = centerX - Right * MM_TO_PIX;
	const _MX = centerX + Left * MM_TO_PIX;
	const _mY = centerY - Up * MM_TO_PIX;
	const _MY = centerY + Down * MM_TO_PIX;
	const [_x1, _y1] = [_mX, _mY];
	const [_x2, _y2] = [_mX, _MY];
	const [_x3, _y3] = [_MX, _MY];
	const [_x4, _y4] = [_MX, _mY];
	return `${x1},${y1} ${_x1},${_y1} \
				  ${x2},${y2} ${_x2},${_y2} \
				  ${x3},${y3} ${_x3},${_y3} \
				  ${x4},${y4} ${_x4},${_y4}`;
}

Command({
	name : "P-III.goHome",
	usage : "[options]",
	description : `
This script is developped for Perpetuité III, an art installation 
made by Felix Luque, Damien Gernay & Vincent Evrard.
Map camera image to rectify perspective
`,
	})
	.option('-i, --input <input>', 'file to rectify', inImgFilePath)
	.option('-o, --output <output>', 'rectified image output file path', outImgFilePath)
	.option('-p, --tagFilePath <tagFilePath>', 'file path of tag positions', tagFilePath)
	.option('-c, --crope <crope>', 'crope output image', stringToBoolean, true)
	.option('-r, --rules <rules>', 'drawRules', stringToBoolean, false)
	.option('-m, --mask <mask>', 'drawMask', stringToBoolean, true)
	.option('-e, --empty <empty>', 'difference with empty', stringToBoolean, true)
	.option('--xOff <xOff>', 'x offSet', parseFloat, xOffCorr)
	.option('--yOff <yOff>', 'y offSet', parseFloat, yOffCorr)
	.option('--xScale <xScale>', 'x scale', parseFloat, xScaleCorr)
	.option('--yScale <yScale>', 'y scale', parseFloat, yScaleCorr)

	.action( async ({debug, tagFilePath, input, output, crope, xOff, yOff, xScale, yScale, rules, mask, empty}) => {
		
		console.log({debug, tagFilePath, input, output, crope, xOff, yOff, xScale, yScale, rules, mask, empty});
		try{
			const [w, h] = await getImageSize(input);
			const [cx, cy] = [w/2, h/2];
			// const MM_TO_PIX = h / (radius*2);
			const [
				{bottomRight}, 
				{topRight},
				{topLeft},
				{bottomLeft}
			] = (await fs.readJson(tagFilePath)).sort((a, b)=>a.id-b.id);




			const coords = perspectiveCmd(
				bottomRight, topRight, topLeft, bottomLeft, 
				cx + xOff, cy + yOff
			);
			const $ = Call({JsonFlag:false, ErrorFlag:false});

			if(!fs.existsSync(maskImgFilePath)){
				await $(`convert -size ${h}x${h} -quiet xc:Black -fill White -draw 'circle ${cy} ${cy} ${cy} 1' -alpha Copy ${maskImgFilePath};`);	
			}
			if(empty){
				await $(`convert ${emptyImgFilePath} ${input} -quiet -compose difference -composite ${diffImgFilePath};`);
				input = diffImgFilePath;
			}
			await $(
				`convert ${input} -quiet \
				\\( -matte -verbose -virtual-pixel transparent -distort Perspective "${coords}" \\) \
				${
					crope 
					?
						`\\( -crop "${h}x${h}+${cx-cy}+0" \\) `
					:
						``
				} \
				${
					mask
					?
						`-gravity Center ${maskImgFilePath} -compose CopyOpacity -composite -trim `
					: 
						``
				} \
				${ 
					rules 
					?
						` \
							${
								[...new Set(probePoints.flat())]
								.map( pos => {
									const y = pos * MM_TO_PIX * 249 / 250 + cy;
									const x = pos * MM_TO_PIX + cy;
									console.log(pos, pos * 249 / 250);
									const hRule = `0,    ${y} ${w}, ${y}`;
									const vRule = `${x}, 0    ${x}, ${h}`;
									return `\
													\\( -stroke blue -draw "line ${hRule}" \\) \
													\\( -stroke blue -draw "line ${vRule}" \\) \
													`
								}).join(` `)
							} \
							\\( -stroke green -draw "line 0,    ${cy} ${h},  ${cy}"     \\) \
							\\( -stroke green -draw "line ${cy},0     ${cy}, ${h}" \\) \
						`
					: 
						``
				} \
				${output}`
			);
		}catch(error){
			console.error(error);
		}
	})
	.parse(process.argv);
