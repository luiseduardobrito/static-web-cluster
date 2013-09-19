module.exports = {
	
	name: {

		required: true,
		type: "string"

	},

	email: {

		required: true,
		type: "email"

	},

	password: {

		required: true,
		type: "password",

		// default: sha256
		encprytion: "sha256"
	},

	access_token: {

		required: true,
		type: "string"

	},

	role: {

		required: true,
		type: "string",
		default: "user"
	},

	_sanitize: function(_this) {

		if(_this.password)
			delete _this.password;

		if(_this._timestamp) {
			_this.created = _this._timestamp;
			delete _this._timestamp
		}

		if(_this.timestamp) {
			_this.created = _this.timestamp;
			delete _this.timestamp
		}
	},

	toJSON: function(_this){

		delete _this.password;
		return JSON.stringify(_this);
	}
}