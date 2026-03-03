#!/usr/bin/env node

import { Vector4, Vector2 } from './../tools/Vector.js';

const a = new Vector4(1, 2, 3, 4);
const b = new Vector2(...a);
const c = new Vector4(...a, 10, 12);
console.log(...a);
console.log(...b);
console.log(...c);