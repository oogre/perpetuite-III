export const ERR = {
	DROP          : "DROP",
	GRAB          : "GRAB",
	MEMORY        : "MEMORY",
	PROC          : "PROCEDURE",
	CONF          : "CONFIGURE",
	PATTERN 	  : "PATTERN",
	PATH 	  	  : "PATH",
	USE			  : "USE",
	CAMERA	 	  : "CAMERA"
};

export class AppError extends Error{
	constructor(code, message, details){
		super(message ?? code);
		this.code = code;
		this.details = details;
	}
	is(code){
		return this.code === code;
	}
}
