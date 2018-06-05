let expect = require('chai').expect;

function getDatabase(name, options){
	const honeyjar = require('../honeyjar')();
	const DB = new honeyjar.DB(name, options);
	return DB;
}

describe('New model creation', function(){
	// TODO : add checks for db saving
	it('Should create a new model and execute a method correctly while saving', function(done){

		const db = getDatabase('test-db');
		class User extends db.Model {
			constructor(name, lastname){
				super('User');
				this.name = name;
				this.lastname = lastname;
			}

			getName(){
				return `${this.name} ${this.lastname}`;
			}
		}

		let u = new User('Jo', 'Colina');
		expect(u.getName()).to.be.eql('Jo Colina');
		setTimeout(done, 100);
	});

	it('Should create a new model and execute a method correctly while saving BASE64', function(done){

		const db = getDatabase('test-db');
		db.config({
			b64: true
		});

		class User extends db.Model {
			constructor(name, lastname){
				super('User');
				this.name = name;
				this.lastname = lastname;
			}

			getName(){
				return `${this.name} ${this.lastname}`;
			}
		}

		let u = new User('Jo', 'BASE64');
		expect(u.getName()).to.be.eql('Jo BASE64');
		setTimeout(done, 100);
	});

	it('Should create a new model and save the db after setting a value (old or new)', function(done){

		const db = getDatabase('test-db');
		class User extends db.Model {
			constructor(name, lastname){
				super('User');
				this.name = name;
				this.lastname = lastname;
			}

			getName(){
				return `${this.name} ${this.lastname}`;
			}
		}

		let u = new User('Jo', 'Colina');
		u.age = 24;
		expect(u.age).to.be.eql(24);
		setTimeout(done, 100);
	});

	it('Should create a new model and save the DB using Model#set', function(done){

		const db = getDatabase('test-db');
		db.config({
			autosave: false
		});

		class User extends db.Model {
			constructor(name, lastname){
				super('User');
				this.name = name;
				this.lastname = lastname;
			}

			getName(){
				return `${this.name} ${this.lastname}`;
			}
		}

		let u = new User('Jo', 'Colina');
		u.set('age', 24);
		expect(u.age).to.be.eql(24);
		setTimeout(done, 100);
	});
});