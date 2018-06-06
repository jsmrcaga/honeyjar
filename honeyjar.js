let factory = function(cluster){
	let honeyjar = {};

	global.__honeyjar = {
		databases: []
	};

	honeyjar.register = function(db){
		let edb = __honeyjar.databases.find(e => e.name === db.name);
		if(edb){
			throw new Error(`[HONEYJAR] Cannot register database with the same name of another registered database (${db.name})`);
		}

		__honeyjar.databases.push(db);
		return db;
	};


	if(cluster){
		// handle clsuterization
	}

	honeyjar.DB = require('./lib/db')(honeyjar);
	return honeyjar;
};

module.exports = factory;