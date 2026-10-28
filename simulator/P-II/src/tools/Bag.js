
export default class Bag{
	#set = new Set();
	failure = null;                                  // première vraie erreur
	add(promise){
		const tracked = promise
			.catch(error=>{
				if(error?.message !== "Move interrupted by a new target"){
					this.failure ??= error;
				}
			})
			.finally(()=>this.#set.delete(tracked));
		this.#set.add(tracked);
	}
	check(){ 
		if(this.failure) throw this.failure; 
	}  // relance l'erreur ACE telle quelle (code '604')
}
