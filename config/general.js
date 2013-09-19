module.exports = {

	state: "production",

	development: {

		port: 3000,

		cluster: {

			max: 1
		},

		db: {
	
			protocol: "mongodb://",

			user: "root",
			password: "",

			db: "main",
			host: "localhost"
		}
	},

	test: {

		port: 3000,

		cluster: {
		
			max: 3
		},

		db: {
	
			protocol: "mongodb://",

			user: "root",
			password: "",

			db: "main",
			host: "localhost"
		}
	},

	production: {

		port: 3000,

		db: {
		
			protocol: "mongodb://",

			user: "root",
			password: "",

			db: "main",
			host: "localhost"
		}
	}
}