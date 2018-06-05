const fs = require('fs');
const Utils = require('../utils/utils');

function factory(db){

	class Handler {
		constructor(model, loaders, savers){
			this.__type = model.__type;
			this.__loaders = loaders;
			this.__savers = savers;
			this.__filename = `${db.options.dir}/${model.__type.toLowerCase()}s.json`;
			this.__data = [];
		}

		update(obj){
			if(obj.__type !== this.__type){
				throw new Error(`[HONEYJAR][Handler] Cannot update ${this.__type} handler with different typed models`);
			}

			if(!obj.__id){
				obj.__id = Utils.genUUID();
				return this.__data.push(obj);
			}

			let e = this.__data.find(e => e.__id === obj.__id);
			if(e){
				// already exists and is a reference
				// updates automatically
				return;
			}

			return this.__data.push(obj);
		}

		__load(){
			return new Promise((resolve, reject) => {
				fs.readFile(this.__filename, {encoding: 'utf8'},  (err, raw) => {
					if(err){
						return reject(err);
					}

					let data = null;
					if(db.options.b64){
						return resolve(Buffer.from(raw, 'base64').toString('utf8'));
					}

					return resolve(Buffer.from(raw).toString('utf8'));
				});
			});
		}

		__save(){
			if(this.__save.__locked){
				this.__save.__queued = true;
				return Promise.resolve();
			}

			this.__save.__locked = true;

			return new Promise((resolve, reject) => {
				let save_data = undefined;
				if(db.options.b64){
					save_data = Buffer.from(JSON.stringify(this.__data)).toString('base64');
				} else {
					save_data = JSON.stringify(this.__data);
				}

				fs.writeFile(this.__filename, save_data, {encoding: 'utf8'}, (err) => {
					this.__save.__locked = false;
					if(this.__save.__queued){
						this.__save.__queued = false;
						this.__save();
					}

					if(err){
						return reject(err);
					}
					return resolve();
				});
			});
		}
	}

	return Handler;
}

module.exports = factory;