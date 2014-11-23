var client = require('./conn').client;
var async = require('async');

function Admin(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

/*
* .save(cb)
* return cb(err)
*/
Admin.isExists = function (name, fn) {
    client.exists('admin:' + name, function(err, flag) {
       fn(err, flag==1 ? true : false);
    });
}

Admin.prototype.save = function(fn) {
    var admin = this;
    async.auto({
        is_exists: function(callback) {
            client.exists('admin:' + name, function(err, flag) {
                if (err) return callback(err);
                if (flag != 1) {
                    callback("admin name exists");
                }
            });
        },
       hmset: ['is_exists', function(callback) {
           client.hmset('admin:' + admin.name, function(err) {
               callback(err);
           });
       }],
        zadd: ['hmset', function (callback) {
            client.zadd('admins', admin.date, admin.name, function(err) {
               callback(err);
            });
        }]
    }, function(err) {
        fn(err);
    });
};


/*
* .update(cb)
* return fn(err)
*/
Admin.prototype.update = function(fn) {
    var admin = this;
    client.hmset('admin:' + admin.name, admin, function(err) {
        fn(err);
    });

};

/*
.getPage(options, fn)
return fn(err, admins, total)
* */
Admin.getPage = function(options, fn) {
    var size = options.size;
    var current = options.current;
    var start = (current - 1) * size;
    var end = current * size - 1;
    var args = ['admins', start, end];

    async.auto({
        get_names:function(callback) {
            client.zrevrange(args, function(err, names) {
                callback(err, names);
            });
        },
        get_objs: ['get_names', function(callback, results) {
            var list = [];
            async.eachSeries(results.get_names, function(name, cb) {
                client.hgetall('admin:' + name, function(err, obj) {
                   if(err) return cb(err);
                    list.push(obj);
                });
            }, function(err) {
                callback(err, list);
            });
        }],
        get_total: function(callback) {
            redis.zcard('admins', function(err, total) {
                callback(err, total);
            })
        }
    }, function(err, results) {
        fn(err, results.get_objs, results.get_total);
    });
};

/*
.delete (name, fn)
 return fn(err)
* */
Admin.delete = function(name, fn) {
    async.auto({
        del_from_list: ['del', function(callback) {
            client.zrem('admins', name, function(err) {
                callback(err);
            });
        }],
        del: function(callback) {
            client.del('admin:' + name, function(err) {
                callback(err);
            });
        }
    }, function(err) {
        fn(err);
    });
};

/*
*.login(name, pass, fn)
* return (err, obj)
* */
Admin.login = function(name, pass, fn) {
    redis.hgetall('admin' + name, function(err, obj) {
        if (err) return fn(err);
        if (obj.pass == pass) {
            fn(null, obj);
        } else {
            fn(null, null);
        }
    })
};



/*
*
* */
module.exports = Admin;