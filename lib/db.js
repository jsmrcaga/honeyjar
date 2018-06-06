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

			return new Proxy(this, proxy.db(this));
		}
	}

	DB.prototype.__update = function(){
		this.__prep = DB.prototype.__prep;
		this.__registerModel = DB.prototype.__registerModel;
		this.__handler = DB.prototype.__handler;
		this.load = DB.prototype.load;
		this.save = DB.prototype.save;
		this.config = DB.prototype.config;
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
		if(!(model instanceof this.Model)){
			throw new Error('[HONEYJAR][DB] You must register a honeyjar.Model object');
		}

		let f = this.__models.find(e => e.__type.toLowerCase() === model.__type.toLowerCase());
		if(f){
			throw new Error(`[HONEYJAR][DB] Cannot register two models with the same name: ${model.__type}`);
		}
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

	DB.prototype.load = function(){
		function load(index){

		}
	};

	DB.prototype.save = function(handler){
		if(handler){
			let h = this.__handlers.find(e => e.__type.toLowerCase() === handler.toLowerCase());
			if(h){
				return h.__save();
			}
		}

		function save(handlers, index=0){
			if(!handlers[index]){
				return Promise.resolve();
			}

			return handlers[index].__save().then(e => {
				return save(handlers, index+1);
			}).catch(e => {
				console.error(`[HONEYJAR][DB] Could not save handler ${handlers[index].__type}`, e);
				return save(handlers, index+1);
			});
		}
		
		return save(this.__handlers).then( () => {
			return;
		}).catch(e => {
			console.error('[HONEYJAR][DB] An error occurred while saving', e);
			throw e;
		});
	};

	DB.prototype.config = function(config){
		for(let k in config){
			this.options[k] = config[k];
		}
	};

	return DB;
}

module.exports = factory;