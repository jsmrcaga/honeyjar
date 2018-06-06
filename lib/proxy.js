module.exports = {
	db: function(db){
		let keys = Object.keys(db);
		return {
			get: function(obj, prop){
				if(keys.indexOf(prop) > -1){
					return obj[prop];
				}

				let handler = obj.__handlers.find(e => e.__type.toLowerCase() === prop.toLowerCase());
				if(!handler){
					handler =	obj.__handlers.find(e => e.__type.toLowerCase() === prop.slice(0, prop.length-1).toLowerCase()); 
				}
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
	},

	handler: function(handler){
		let keys = Object.keys(handler);
		return {
			get: function(obj, prop){
				if(!(typeof prop === 'string')){
					return;
				}

				if(keys.indexOf(prop) > -1){
					return obj[prop];
				}

				if(prop.indexOf('findBy') === 0){
					let key = prop.replace('findBy', '').toLowerCase();
					return obj.__findBy(key);
				}

				return obj[prop] || undefined;
			}
		}
	}
};