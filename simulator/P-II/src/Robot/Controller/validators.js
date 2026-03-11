
import Position from './Position.js';
import Request from './Request.js';
export * from './../../tools/validators.js';
export const isPosition = (obj) => obj instanceof Position;
export const isRequest = (obj) => obj instanceof Request;