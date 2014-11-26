var assert = require('assert');
var Admin = require('../models/Admin');
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

describe("Admin.js", function() {
    before('clear', function(done) {
        client.flushall(function(err) {
            if (err) throw err;
            done();
        });
    });

    it(".save(obj)", function(done) {
        var a1 = new Admin({
            name: 'name1',
            pass: 'pass1',
            date: new Date().getTime()
        });

        a1.save(function(err) {
            console.dir(err);
            console.log("save===" + err);
            assert.equal(null, err);
            done();
        });
    });

    it(".login(name1, pass1, fn)", function(done) {
        Admin.login('name1', 'pass2', function(err, obj) {

            //assert.equal(null, err);
            assert.equal('用户名密码不匹配!', err);
            done();
        });
    });

   it(".save(exists)", function(done) {
      var a1 = new Admin({
          name: 'name1',
          pass: 'pass1',
          date: new Date().getTime()
      });

       a1.save(function(err) {
           console.dir(err);
           //console.log(results);
           assert.equal('用户名已存在', err);
           done();
       });
   });

    it(".update", function(done) {
       var a1 =  new Admin({
          name: "name1",
           pass: "pass2",
           date: new Date().getTime()
       });

        a1.update(function(err) {
            console.log(err);
            assert.equal(null, err);
            done();
        })
    });

    it(".delete", function(done) {
        Admin.delByName('name1', function(err) {
            console.log('it del');
            console.log(err);
            assert.equal(null, err);
            done();
        });
    });



   it(".save(1000)", function() {

       for(var i=0; i<1000; i++) {
           var a = new Admin({
               name: 'nameid' + i,
               pass: 'pass1' + i,
               date: new Date().getTime()
           });

           a.save(function(err, results) {
               //console.log(err);
               //console.log(results);
               assert.equal(null, err);
           });
       }
   });

   after('.getPage({size:10, current:1})', function(done) {
        Admin.getPage({size:10, current:1}, function(err, admins, total) {
            console.log(err);
            console.log(admins);

            assert.equal(1000, total);
            done();
        })
   });



});

//describe("redis.exists", function() {
//    it('should return （null, 1/0） ', function(done) {
//        client.exists('admin:1', function(err, result) {
//            console.log(err);
//            console.log(result);
//            assert.equal(1, result);
//            done();
//        });
//    });
//});