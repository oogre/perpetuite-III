#!/usr/bin/env node


import Pills from "./../Pills"
import PillModel from "./../Pills/PillModel.js"
import {getRandomLocationOnCircle, lerp} from "./../tools/math.js";


const pills = new Pills(600);

// pills.add(
// 	Pills.createPill({box:[0, 0, 15, 15]})
// )

// pills.add(
// 	Pills.createPill({box:[1, 0, 15, 15]})
// )

// for(let t = 0 ; t < 100 ; ){
// 	let location = getRandomLocationOnCircle(600);
// 	const pill = Pills.createPill({
// 		box :[ location.x, location.y, 15, 15], 
// 		avgRGB : (new PillModel.Color()).rgb
// 	});
// 	let len = pills.length
// 	pills.add(pill)
// 	if(len != pills.length){
// 		t++
// 	}
	
	
// }
// console.log(pills.length);

import FastSet from "collections/fast-set";

var nameSet = new FastSet(null, function (a, b) {
	console.log("equals")
    return a.name === b.name;
}, function (object) {
	console.log("hash")
    return object.name;
});
nameSet.add({name: "Kris", github: "kriskowal"});
// true
nameSet.add({name: "Stuart", github: "stuk"});
// true

// {"name":"Kris","github":"kriskowal"}
nameSet.add({name: "Stuart", github: "wrong"});

nameSet.add({name: "Bob", github: "wrong"});
nameSet.add({name: "Kris", github: "yo"});
// false

// {"name":"Stuart","github":"stuk"}