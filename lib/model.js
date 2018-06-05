const proxy = require('./proxy');
const fs = require('fs');

function factory(db){

	class Model {
		constructor(type){
			this.__type = type;
			this.__register();
			this.__handler = db.__handler(this);
			this.__handler.update(this);

			this.__update();

			return new Proxy(this, proxy.model(this, db));
		}

		__update(){
			this.__register = Model.prototype.__register;
			this.__save = Model.prototype.__save;
			this.set = Model.prototype.set;
			this.toJSON = Model.prototype.toJSON;
		}

		__register(){
			return db.__registerModel(this);
		}

		__save(){
			return this.__handler.__save();
		}

		set(prop, val){
			this[prop] = val;
			this.__save();
		}

		toJSON(){
			let obj = Object.assign({}, this);
			delete obj.__handler;
			delete obj.__type;
			return obj;
		}

	}

	return Model;
}

module.exports = factory;