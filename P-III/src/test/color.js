#!/usr/bin/env node

import Color from './../common/Color.js';

const black = new Color(0, 0, 0);
const red = new Color(255, 0, 0);
const yellow = new Color(0, 255, 0);
const blue = new Color(0, 0, 255);
const white = new Color(255, 255, 255);

const test = (color) => {
	console.log(color);
	console.log(`to array : ${color.toArray()}`);
	console.log(`to toString : ${color.toString()}`);
	console.log(`is Black : ${color.isBlack()}`);
	console.log(`is equals to itself : ${color.equals(color)}`);
	console.log(`is equals to black : ${color.equals(black)}`);
	console.log(`is equals to red : ${color.equals(red)}`);
	console.log(`is equals to blue : ${color.equals(blue)}`);
	console.log(`is equals to yellow : ${color.equals(yellow)}`);
	console.log('---');
}

test(black);
test(red);
test(yellow);
test(blue);
test(white);

