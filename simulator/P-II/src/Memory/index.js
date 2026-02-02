import Pills from "./../Pills";
import MemoryUI from './UI.js';

export default class Memory extends Pills{
	constructor(conf){
		super(conf);
		this.ui = new MemoryUI(this);
	}
}