#!/usr/bin/env node

import {getArc} from './../common/Path.js';
import Vector from './../common/Vector.js';



console.log(...getArc(new Vector(0, 0, 0), new Vector(300, 0, 0)));
console.log(...getArc(new Vector(0, 0, 0), new Vector(300, 0, 0)));

