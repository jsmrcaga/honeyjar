# Honeyjar 🍯

A super simple DB in JSON format! 

This project is intended for people that don't really like messing with "real" databases (SQL, Mongo, Redis, etc.) and
need a simple data management solution for small projects.

Note that I've deployed similar solutions on full-scale applications that work perfectly, though you might want to run
your own tests to be sure!

I decline all responsability from everything related to the use of this project, use at your own risk!

---

## tl;dr
```javascript
const honeyjar = require('honeyjar')();

// you can create different dbs
// just need to change the name!
const myDatabase = honeyjar.DB('mydb', {
	autosave: true
});

// we extend from the db we instantiated
// important!
class User extends myDatabase.Model {
	constructor(name){
		super('User');
		this.name = name;
	}
}

class App extends myDatabase.Model {
	constructor(key){
		super('App');
		this.key = key;
	}
}


// you should always register models (& handlers)
// they will be auto-registered when instantiating
// an object, but loading will probably cause problems
// for more info check the tests
myDatabase.registerModel(User);
myDatabase.registerModel(App);

myDatabase.load().then(d => {
	// d is a collection like so:
	// [{__type: 'User', data: [User {name: 'Plep'}, User {name: 'User2'}]}, {__type: 'App', data: []}]
	
	// now we can safely use the db auto-properties
	myDatabase.Users.findByName('Jo').then(users => {
		// users is an array;
		let jo = users[0];

		// db will autosave if the option was set to true
		jo.lastname = 'Colina';
	}).catch(e => {});

}).catch(e => {
	// oops!
});
```

## API

Coming soon!

## Roadmap

### Clustering
 A clustering option is in the works so you can use this DB in a cluster server ;) 

 It will work via IPC (`process.send()`), which explains all the promises everywhere. The point
 is to let you use every call as you would in the master process, but will be handled differently if the
 current process is the child, so it can communicate with the parent.
