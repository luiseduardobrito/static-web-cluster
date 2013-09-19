var extend = require("extend");
var crypto = require("crypto");
var mongo = require("./mongo");
var log = require("winston");

var DEFAULT_ENCRYPTION = "sha256";

var Type = function() {

	var exports = {};

	var handlers = {};

	function int(input) {

		if(input === null) {
			throw new Error("The input should not be null.");
		}

		else if(typeof input !== typeof 0) {
			throw new Error("The input should be a number");
		}

		else if(input !== parseInt(input)) {
			throw new Error("The input should be an integer");
		}

		return true;
	}; 

	handlers.int = {
		tags: ["int", "integer"],
		check: int
	}

	function string(input) {

		if(input === null) {
			throw new Error("The input should not be null.");
		}

		else if(typeof input !== typeof "str") {
			throw new Error("The input should be a string");
		}

		return true;
	}

	handlers.string = {
		tags: ["str", "string"],
		check: string
	}

	function password(input) {

		try {

			if(toString.call(input) !== toString.call({}))
				throw new Error("Input is not an object.")

			if(typeof input._encrypted === typeof "str")
				return true;

			else
				throw new Error("Input is a not an encrypted password");
		}

		catch(e)
		{

			if(input === null) {
				throw new Error("The input should not be null.");
			}

			else if(typeof input !== typeof "str") {
				throw new Error("The input should be a string");
			}

			else if(!input.length || input.length < 8) {
				throw new Error("The input password should be at least 8 characters length.");	
			}
			
			return true;
		}
	}

	handlers.password = {
		tags: ["pass", "password"],
		check: password
	}

	function email(input) {

		if(typeof input !== typeof "str") {
			throw new Error("The input should be a string");
		}

		else {

			if(input.indexOf('@') == -1 || input.indexOf('.') == -1){
				throw new Error("The input should be a valid email");
			}

			try {

				var domain = input.split('@')[1];

				if(domain.length < 3)
					throw new Error();
			}
			catch(e) {
				throw new Error("The domain should be valid.");
			}
		}

		return true;
	};

	handlers.email = {
		tags: ["email"],
		check: email
	}

	function object(input) {

		if(input === null) {
			throw new Error("The input should not be null.");
		}

		if(typeof input !== typeof {}) {
			throw new Error("The input should be an object.");
		}

		if(toString.call(input) != toString.call({})) {
			throw new Error("The input should be an object.");
		}

		return true;
	};

	handlers.object = {
		tags: ["object", "obj"],
		check: object
	}

	function array(input) {

		if(input === null) {
			throw new Error("The input should not be null.");
		}

		if(typeof input !== typeof []) {
			throw new Error("The input should be an array.");
		}

		if(toString.call(input) != toString.call([])){
			throw new Error("The input should be an array.");
		}

		return true;
	};

	handlers.array = {
		tags: ["array", "arr"],
		check: array
	}

	function get(str) {
		for(var k in handlers)
			for(var i = 0; i < handlers[k].tags.length; i++)
				if(handlers[k].tags[i] == str)
					return handlers[k]

		return false;

	}; exports.get = get;

	function init(){
		exports.handlers = handlers;
		return exports;
	}

	return init();
}

var Model = function(type) {
	
	var exports = {type: type};

	var _model = {

		_id: {
			type: "string",
			default: "hashkey",
			required: true
		},

		_timestamp: {
			type: "string",
			default: "timestamp",
			required: true
		},

		_toJSON: function(_this) {

			return JSON.stringify(_this._sanitize(_this) || _this);
		},

		toJSON: function(_this) {

			return (_this._toJSON ? _this._toJSON(_this) : JSON.stringify(_this._sanitize ? _this._sanitize(_this) : _this));
		}
	};

	function sanitize(_this) {

		for(var k in _this) {
			if(toString.call(_this[k]) == toString.call(function(){}))
				delete _this[k];
		}

		if(_this && _this._timestamp)
			delete _this.timestamp

		if(_this && _this._model)
			delete _this._model

		return _this;
	}

	function encrypt(value, method){

		method = method || DEFAULT_ENCRYPTION || "sha256";

		if(toString.call(value) == toString.call({})
			&& value._encrypted)
			return value;

		try {
			return {
				_encrypted: crypto.createHash(method).update(value).digest("hex"),
				_method: method
			};

		} catch(e) {
			log.error(e)
			throw new Error("Problem encrypting password using " + (method || "sha256") + " algorithm.");
		}
	}

	function generate_default(d) {

		if(d == "hashkey") {

			try {

				var buf = crypto.randomBytes(16);
				return buf.toString('base64');

			} catch (e) {
				throw new Error("Problem generating random hash.");
			}
		}

		else if(d == "timestamp")
			return (new Date()).toISOString()

		else if(d == "null" || d == null)
			return null

		else
			return d;
	} 

	function initialize(obj, model) {

		// validate
		for(var k in model) {

			if(toString.call(model[k]) == toString.call(function(){})) {
				obj[k] = model[k]
			}

			else if(model[k].required || model[k].type == "password") {

				try {

					if(!type.get(model[k].type))
						throw new Error("Specified type is not recognized ("+model[k].type+")")

					type.get(model[k].type).check(obj[k]);
				}
				catch(e) {

					if(model[k].default)
						obj[k] = generate_default(model[k].default)
					else
						throw new Error("Could not parse required field '" + k + "'. " + e.message.toString());
				}
			}
			else {
				try {
					type.get(model[k].type).check(obj[k]);
				}
				catch(e) {
					obj[k] = null
				}
			}

			if(model[k].type == "password") {

				if(model[k] !== false && (!model[k].encryption || model[k].encryption == true))
					model[k].encryption = DEFAULT_ENCRYPTION || "sha256";

				obj[k] = encrypt(obj[k], model[k].encryption)
			}
		}

		return obj;
	};

	function create(name, input) {

		var m = require("../models/" + name + "_model");

		// check sanitizer
		if(m._sanitize) {

			var custom_stz = m._sanitize;
			var default_stz = sanitize;

			m._sanitize = function(_this) {
				var result = custom_stz(_this);
				result = default_stz(_this);
				return result;
			}
		}
		else
			m._sanitize = sanitize;

		m.sanitize = m._sanitize;

		var created = {}

		extend(created, _model);
		extend(created, m);

		created = initialize(input, created);

		extend(created, {_model: name});

		return created;

	}; exports.create = create;

	function save(obj, cb) {

		cb = cb || function(){};
		
		if(!obj._model || obj._model == null || obj._model == "") {
			throw new Error("Object provided is not from any framework model, we can't persist it");
		}

		if(!obj._id) {
			throw new Error("Object provided has none primary key, the default '_id' was removed");
		}

		// ensure encryption
		var db = mongo.connect(obj._model);
		obj = create(obj._model, obj);

		// place timestamp by default
		obj.timestamp = obj.timestamp || (new Date()).toISOString();

		db.find({

			_id: obj._id

		}, function(err, docs) {

			if(err)
				throw new Error("Problem querying database. " + err.message.toString());

			if(!docs || docs.length == 0) {

				db.save(obj, function(err, obj){

					if(err)
						throw new Error("Problem querying database. " + err.message.toString());

					cb(true);
				});
			}

			else {

				db.update({
					_id: obj._id
				}, obj, {multi:false}, function(err) {

					if(err)
						throw new Error("Problem querying database. " + err.message.toString());

					cb(true);
				});

			}
		})

		return true;

	}; exports.save = save;

	function find(name, rest, cb) {

		name = name;
		cb = cb || function(){};
		rest = rest || {};

		var m = require("../models/" + name + "_model");

		for(var k in rest) {
			if(m[k] && m[k].type == "password" && m[k].encryption !== false)
				rest[k] = encrypt(rest[k], m[k].encryption)
		}

		var db = mongo.connect(name);

		db.find(rest, function(err, docs) {

			if(err) {
				throw new Error("Problem querying database: "+err)
			}

			for(var i = 0; i < docs.length; i++) {

				docs[i] = create(name, docs[i]);
			}

			cb(docs || []);

		});

	}; exports.find = find;

	function remove(name, rest, cb) {

		name = name;
		cb = cb || function(){};
		rest = rest || {};

		var db = mongo.connect(name);

		db.remove(rest);
		cb(true);

	}; exports.remove = remove;

	function clear(name, cb) {

		name = name;
		cb = cb || function(){};

		var db = mongo.connect(name);

		db.remove();
		cb(true);

	}; exports.clear = clear;

	function init() {
		return exports;
	};

	return init();
}

module.exports = new Model(new Type());