var client = require('./conn').client;
var async = require('async');

function Admin(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

Admin.prototype.save = function(fn) {
    if (this.id) {
        this.update(fn);
    } else {
        var admin = this;
        async.auto({
            incr: function(callback) {
                client.incr('admins:count', function(err, id) {
                   callback(err, id);
                });
            },
            update: ['incr', function(callback, results) {
                admin.id = results.incr;
                admin.update(function(err) {
                   callback(err);
                });
            }],
            add_to_list: ['incr', 'update', function(callback, results) {
                admin.id = results.incr;
                admin.addToList(function(err) {
                    callback(err);
                });
            }]
        }, function(err, results) {
            fn(err, results);
        });

    }
};

Admin.prototype.update = function(fn) {
    var admin = this;
    client.hmset('admin:' + admin.id, admin, function(err) {
        fn(err);
    });

};


Admin.prototype.addToList = function(fn) {
    var admin = this;
    client.zadd(['admins', admin.date, admin.id], function(err) {
        fn(err);
    });
};

Admin.prototype.getPage = function(options, fn) {
    var size = options.size;
    var current = options.current;

    var start = (current - 1) * size;
    var end = current * size - 1;

    var args = ['admins', start, end];
    client.zrevrange(args, function(err, results) {
        if (err) return fn(err);

        async.sortBy(results, function(id, callback) {
            client.hgetall('admin:' + id, function(err, admin) {
               callback(err, admin.date*-1);
            });
        }, function(err, results) {
            fn(err, results);
        });
    });
};

module.exports = Admin;