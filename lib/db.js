const proxy = require('./proxy');
const Model = require('./model');

const fs = require('fs');

function factory(honeyjar){

	class DB {
		constructor(name, options){
			
			this.name = name;

			this.options = {
				autosave: true,
				dir: `./db/${this.name}`,
				__defaultdir: true
			};

			this.__models = [];
			this.__handlers = [];
			
			this.__events = {
				save: [],
				load: []
			};

			this.Model = Model(this);

			this.__update();

			if(options){
				this.config(options);

				if(options.load){
					this.load();
				}
			}

			this.__prep();

			this.Handler = require('./handler')(this);

			honeyjar.register(this);

			return new Proxy(this, proxy.db(this));
		}
	}

	DB.prototype.__update = function(){
		this.__prep = DB.prototype.__prep;
		this.__registerModel = DB.prototype.__registerModel;
		this.__handler = DB.prototype.__handler;
		this.__model = DB.prototype.__model;
		this.load = DB.prototype.load;
		this.save = DB.prototype.save;
		this.config = DB.prototype.config;
		this.registerHandler = DB.prototype.registerHandler;
		this.registerModel = DB.prototype.registerModel;
	};

	DB.prototype.__prep = function(){
		if(this.options.__defaultdir){
			if(!fs.existsSync('./db')){
				console.log('[HONEYJAR][DB] Creating directory', './db');
				fs.mkdirSync('./db');
			}
		}

		if(!fs.existsSync(this.options.dir)){
			console.log('[HONEYJAR][DB] Creating directory', this.options.dir);
			fs.mkdirSync(this.options.dir);
		}
	};

	DB.prototype.__registerModel = function(model){
		let f = this.__models.find(e => e.name.toLowerCase() === model.__type.toLowerCase());
		if(f){
			throw new Error(`[HONEYJAR][DB] Cannot register two models with the same name: ${model.__type}`);
		}

		this.__models.push(model);
	};

	DB.prototype.__model = function(type){
		return this.__models.find(e => e.name.toLowerCase() === type.toLowerCase());
	};

	DB.prototype.__handler = function(model){
		let h = this.__handlers.find(e => e.__type === model.__type);
		if(!h){
			// create
			let handler = new this.Handler(model);
			this.__handlers.push(handler);
			return handler;
		}

		return h;
	};

	DB.prototype.registerHandler = function(name){
		return this.__handler({
			__type: name
		});
	};

	DB.prototype.registerModel = function(model){
		this.__registerModel(model);
		this.registerHandler(model.name);
	};

	DB.prototype.load = function(){
		let loaded = [];

		for(let h of this.__handlers){
			let p = h.__load().then(d => {
				return {
					__type: h.__type,
					data: d
				};
			}).catch(e => {
				console.error(`[HONEYJAR][DB] Could not load handler ${handlers[index].__type}`, e);
				throw e;
			});
			loaded.push(p);
		}

		return Promise.all(loaded);
	};

	DB.prototype.save = function(handler){
		if(handler){
			let h = this.__handlers.find(e => e.__type.toLowerCase() === handler.toLowerCase());
			if(h){
				return h.__save();
			}
		}

		let saved = [];
		for(let h of this.__handlers){
			let p = h.__save().then(d => {
				return d;
			}).catch(e => {
				console.error(`[HONEYJAR][DB] Could not save handler ${handlers[index].__type}`, e);
				throw e;
			});
			saved.push(p);
		}

		return Promise.all(saved);
	};

	DB.prototype.config = function(config){
		for(let k in config){
			this.options[k] = config[k];
		}
	};

	return DB;
}

module.exports = factory;