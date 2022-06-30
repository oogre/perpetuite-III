/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-04-05 14:06:35
\*----------------------------------------*/

import WebsocketWrapper from "./WebsocketWrapper.js";







let server;

const connect = (event) => {
	event.preventDefault();
	const formData = new FormData(event.target);
	const serverAddress = `${formData.get("address")}:${formData.get("port")}`;
	server = new WebsocketWrapper(serverAddress);
	server.on("open", async (evt) => {
		steps[stepCursor].classList.toggle("show");
		stepCursor++;
		steps[stepCursor].classList.toggle("show");
		statusLabel.innerText = `Connected to ${serverAddress}`
		//const data = await server.send("hello World")
		//console.log(data);
		
	}).on("message", (evt)=>{
		console.log("message", event);
	}).on("close", (evt)=>{
		// console.log(event);
	}).on("error", (evt)=>{
		// console.log(event);
	});
	return false;
};

const connectForm = document.querySelector("#connection");
const statusLabel = document.querySelector("#status");

const steps = document.querySelectorAll(".step");
let stepCursor = 0;
steps[stepCursor].classList.toggle("show");


statusLabel.innerText = "Disconnected";
connectForm.addEventListener("submit", connect)
