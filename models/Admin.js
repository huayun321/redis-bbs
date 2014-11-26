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
            client.exists('admin:' + admin.name, function(err, flag) {
                if (err) return callback(err);
                if (flag == 1) {
                    console.log(flag);
                    callback("用户名已存在");
                } else {
                    callback(err);
                }
            });
        },
       hmset: ['is_exists', function(callback) {
           client.hmset('admin:' + admin.name, admin, function(err) {
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
    //
    async.auto({
        get_names: function(callback) {
            client.zrevrange(args, function(err, names) {
                callback(err, names);
            });
        },
        get_objs: ['get_names', function(callback, results) {
            async.mapSeries(results.get_names, function(name, cb) {
                client.hgetall('admin:' + name, function(err, obj) {
                    cb(err,obj);
                });
            }, function(err, results) {
                callback(err, results);
            });
        }],

        get_total: function(callback) {
            client.zcard('admins', function(err, total) {
                callback(err, total);
            })
        }
    }, function(err, results) {
        fn(err, results.get_names, results.get_total);
    });
    //var list = [];
    //async.map(['admin:nameid1', 'admin:nameid2', 'admin:nameid3'], client.hgetall, function(err, results) {
    //    fn(err, results, 3);
    //});
    //fn(null, null, null);
};

/*
.delete (name, fn)
 return fn(err)
* */
Admin.delByName = function(name, fn) {
    async.auto({
        del: function(callback) {
            client.del('admin:' + name, function(err) {
                callback(err);
            });
        },
        del_from_list: function(callback) {
            client.zrem('admins', name, function(err) {
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
    client.hgetall('admin:' + name, function(err, obj) {
        if (err) return fn(err);
        //console.log('admin.login:' + err);
        if (obj && obj.pass == pass) {
            fn(null, obj);
        } else {
            fn('用户名密码不匹配!');
        }
    })
};



/*
*
* */
module.exports = Admin;