module.exports = {
	
	result: {

		required: true,
		type: "string"

	},

	code: {

		required: true,
		type: "integer",
		default: 200

	},

	message: {

		required: false,
		type: "string"
	},

	data: {

		required: true,
		type: "object",
		default: {}
	}
}