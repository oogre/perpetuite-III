/*----------------------------------------*\
  easyPlayer - WebsocketWrapper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:14:24
  @Last Modified time: 2022-04-05 13:50:54
\*----------------------------------------*/

import Emittery from "emittery";
import {isFnc, uniqId} from "./Tools.js";

const eventTypes = ["open", "message", "close", "error"];

export default class WebsocketWrapper extends WebSocket{
	constructor(wssURL){
		super(wssURL);
		this.emitter   = new Emittery();
		this.onopen    = event => this.emitter.emit("open", event);
		this.onmessage = event => this.emitter.emit("message", event);
		this.onclose   = event => this.emitter.emit("close", event);
		this.onerror   = event => this.emitter.emit("error", event);
	}
	on(eventName, handler){
		if(!eventTypes.includes(eventName)) 
			throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
		if(!isFnc(handler))
			throw new Error("Second parameter need to be a function");
		this.emitter.on(eventName, handler);
		return this;
	}
	once(eventName, handler){
		if(!eventTypes.includes(eventName)) 
			throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
		if(!isFnc(handler))
			throw new Error("Second parameter need to be a function");
		this.emitter.once(eventName, handler);
		return this;
	}
	off(eventName, handler){
		if(!eventTypes.includes(eventName)) 
			throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
		if(!isFnc(handler))
			throw new Error("Second parameter need to be a function");
		this.emitter.off(eventName, handler);	
		return this;
	}
	send(message){
		message = {
			id : uniqId(),
			message : message
		};
		
		const result = new Promise((resolve, reject)=>{
			const callback = event => {
				console.log("callback", event);
				const reply = JSON.parse(event.data);
				if(reply.id == message.id){
					this.off("message", callback);
					resolve(reply.message);
					return true;
				}
				return false;
			};
			this.on("message", callback);
		});
		super.send(JSON.stringify(message));
		return result;
	}
}


