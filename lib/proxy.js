module.exports = {
	db: function(db){
		let keys = Object.keys(db);
		return {
			get: function(obj, prop){
				if(keys.indexOf(prop) > -1){
					return obj[prop];
				}

				let handler = obj.__handlers.find(e => e.name.toLowerCase() === prop.toLowerCase());
				return handler;
			}
		};
	},

	model: function(model, db){
		return {
			set: function(obj, prop, val){
				obj[prop] = val;
				// save db
				if(db.options.autosave){
					obj.__save();
				}
				return true;
			}
		}
	}
};