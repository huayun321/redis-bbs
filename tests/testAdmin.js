var assert = require('assert');
var Admin = require('../models/Admin');
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

//describe("Admin.js", function() {
//    before('clear', function(done) {
//        client.flushall(function(err) {
//            if (err) throw err;
//            done();
//        });
//    });
//
//
//   it(".save(obj)", function(done) {
//      var a1 = new Admin({
//          name: 'name1',
//          pass: 'pass1',
//          date: new Date().getTime()
//      });
//
//       a1.save(function(err, results) {
//           //console.log(err);
//           //console.log(results);
//           assert.equal(null, err);
//           done();
//       });
//   });
//
//   it(".save(10000)", function() {
//
//       for(var i=0; i<1000; i++) {
//           var a = new Admin({
//               name: 'name1',
//               pass: 'pass1',
//               date: new Date().getTime()
//           });
//
//           a.save(function(err, results) {
//               //console.log(err);
//               //console.log(results);
//               assert.equal(null, err);
//
//               var a2 = new Admin({
//                   name: 'name2',
//                   pass: 'pass2',
//                   date: new Date().getTime()
//               });
//
//               a2.save(function(err, results) {
//                   //console.log(err);
//                   //console.log(results);
//                   assert.equal(null, err);
//
//               });
//
//
//           });
//
//       }
//
//
//
//   });
//
//    it('.getPage({size:10, current:1})', function(done) {
//        var a = new Admin();
//        a.getPage({size:10, current:1}, function(err, results) {
//            console.log(err);
//            console.log(results);
//
//            //assert.equal(3, results.length);
//            done();
//        })
//    });
//
//    it('.delete(id)', function(done) {
//        Admin.delete(10000, function(err, resluts) {
//            console.log(err);
//            console.log(resluts);
//            done();
//        });
//    })
//
//});

describe("redis.exists", function() {
    it('should return （null, 1/0） ', function(done) {
        client.exists('admin:1', function(err, result) {
            console.log(err);
            console.log(result);
            assert.equal(1, result);
            done();
        });
    });
});