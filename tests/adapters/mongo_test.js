var mongo = require("../../api/adapters/mongo");
var log = require("winston");

var model = require("../../api/adapters/model");

exports.test_simpleCollection = function(test){

	var db = mongo.connect("test");

	db.save({

		test: "ok",
		timestamp: (new Date()).toISOString()

	}, function(){

		db.find(function(err, docs){

			log.info("Tests found in database: "+docs.length)
			test.ok(docs.length, "Should return some value.");
			test.done();

		});
	})
}

exports.test_saveModel = function(test) {

	var t = model.create("test", {

		test: "ok"

	});

	test.expect(1);

	model.save(t, function(res){

		test.ok(res, "Saved model result should be valid");
		test.done();
	})
}

exports.test_findModel = function(test) {

	test.expect(2);

	model.find("test", {}, function(res){

		test.ok(res, "Queried model result should be valid");
		test.ok(res.length, "Queried model result should be a non-empty array");
		test.done();
	})
}

exports.test_removeModel = function(test) {

	test.expect(1);

	var t = model.create("test", {

		test: "ok"

	});

	test.expect(2);

	model.save(t, function(res){

		model.remove("test", {}, function(res){

			model.find("test", {}, function(res){

				test.ok(res, "Queried model result should be valid");
				test.ok(res.length == 0, "Queried model result should be an empty array");
				test.done();
			})
		})
	})
}

exports.test_clearModel = function(test) {

	test.expect(1);

	model.clear("test", function(res){

		test.ok(res, "Queried model result should be valid");
		test.done();
	})
}

exports.test_clearModel = function(test) {

	test.expect(1);

	var t = model.create("test", {

		test: "ok"

	});

	test.expect(2);

	model.save(t, function(res){

		model.clear("test", function(res){

			model.find("test", {}, function(res){

				test.ok(res, "Queried model result should be valid");
				test.ok(res.length == 0, "Queried model result should be an empty array");
				test.done();
			})
		})
	})
}