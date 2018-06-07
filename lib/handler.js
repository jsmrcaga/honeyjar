const fs = require('fs');
const Utils = require('../utils/utils');
const proxy = require('./proxy');

function factory(db){

	class Handler {
		constructor(model, loaders, savers){
			this.__type = model.__type;
			this.__loaders = loaders;
			this.__savers = savers;
			this.__filename = `${db.options.dir}/${model.__type.toLowerCase()}s.json`;
			this.__data = [];

			this.__update();
			return new Proxy(this, proxy.handler(this));
		}
	}

	Handler.prototype.get= function(id){

	};

	Handler.prototype.__findBy = function(prop){
		return (val) => {
			return new Promise((resolve, reject) => {
				let f = this.__data.filter(e => e[prop] === val);
				return resolve(f);
			});
		}
	};

	Handler.prototype.update = function(obj){
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
	};

	Handler.prototype.__update = function(){
		this.update = Handler.prototype.update;
		this.get = Handler.prototype.get;
		this.__findBy = Handler.prototype.__findBy;
		this.__load = Handler.prototype.__load;
		this.__save = Handler.prototype.__save;
	};

	Handler.prototype.__load = function(){
		let model = db.__model(this.__type);
		console.log(`[HONEYJAR][HANDLER] Loading data for ${model.name}`);
		return new Promise((resolve, reject) => {
			fs.readFile(this.__filename, {encoding: 'utf8'},  (err, raw) => {
				if(err){
					return reject(err);
				}

				let data = null;
				if(db.options.b64){
					data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
				} else {
					data = JSON.parse(Buffer.from(raw).toString('utf8'));
				}

				let models = [];
				for(let d of data){
					let m = new model({
						autosave: false
					});
					for(let k in d){
						m[k] = d[k];
					}
					m.__options.autosave = true;
					models.push(m);
				}

				this.__data = models;

				return resolve(this.__data);
			});
		});
	};

	Handler.prototype.__save = function(){
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
	};

	return Handler;
}

module.exports = factory;