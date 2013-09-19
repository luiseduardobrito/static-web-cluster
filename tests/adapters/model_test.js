var model = require("../../api/adapters/model");
var type = require("../../api/adapters/model").type;

exports.test_simpleInteger = function(test) {

	var integer = type.get("integer");

	test.ok(integer.check(0), "Should return true, integer is valid.");

	test.throws(function(){
		integer.check("str")
	}, Error, "Should throw exception, integer is not valid.");

	test.done();
}

exports.test_simpleString = function(test) {

	var string = type.get("string");

	test.ok(string.check("str"), "Should return true, string is valid.");

	test.throws(function(){
		string.check(0)
	}, Error, "Should throw exception, string is not valid.");

	test.done();
}

exports.test_simpleEmail = function(test) {

	var email = type.get("email");

	test.ok(email.check("name@domain.com"), "Should return true, email is valid.");

	test.throws(function(){
		email.check(0)
	}, Error, "Should throw exception, email is an integer.");

	test.throws(function(){
		email.check("str")
	}, Error, "Should throw exception, email is not valid.");

	test.throws(function(){
		email.check("name.domain.com")
	}, Error, "Should throw exception, email is not valid.");

	test.done();
}

exports.test_simpleObject = function(test) {

	var obj = {test: "object", recursive: {}};

	var object = type.get("object");

	test.ok(object.check(obj), "Should return true, object is valid.");

	test.throws(function(){
		object.check("")
	}, Error, "Should throw exception, object is not valid.");

	test.throws(function(){
		object.check([])
	}, Error, "Should throw exception, object is not valid.");

	test.done();
}

exports.test_simpleArray = function(test) {

	var arr = ["elem1", "elem2", ["elem3", ["elem4"]]];

	var array = type.get("array");

	test.ok(array.check(arr), "Should return true, array is valid.");

	test.throws(function(){
		array.check("")
	}, Error, "Should throw exception, array is not valid.");

	test.throws(function(){
		array.check({test: "ok"})
	}, Error, "Should throw exception, array is not valid.");

	test.done();
}

exports.test_simpleUserModel = function(test) {

	var user = model.create("user", {

		name: "name",
		email: "email@provider.com",
		password: "abcd1234",
		access_token: "01234567890"

	});

	test.expect(6);

	test.ok(user.name == "name", "User name should be valid");
	test.ok(user.email == "email@provider.com", "User email should be valid");
	test.ok(user.password == "abcd1234", "User password should be valid");
	test.ok(user.access_token == "01234567890", "User access_token should be valid");

	test.ok(user._id, "Model _id hash should be valid");
	test.ok(user.toJSON, "Model 'toJSON' should be valid");

	test.done();
}