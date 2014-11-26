var client = require('./conn').client;
var async = require('async');

function Post(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

/*
 * .save(cb)
 * return cb(err)
 */
Post.prototype.save = function(fn) {
    var post = this;
    async.auto({
        incr: function(callback) {
          client.incr('posts:count', function(err, id) {
              callback(err, id);
          })
        },
        hmset: ['incr', function(callback, results) {
            client.hmset('post:' + results.incr, post, function(err) {
                callback(err);
            });
        }],
        zadd: ['incr', 'hmset', function (callback, results) {
            client.zadd('posts', post.date, results.incr, function(err) {
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
Post.prototype.update = function(fn) {
    var post = this;
    client.hmset('post:' + post.id, post, function(err) {
        fn(err);
    });

};

/*
 .getPage(options, fn)
 return fn(err, admins, total)
 * */
Post.getPage = function(options, fn) {
    var size = options.size;
    var current = options.current;
    var start = (current - 1) * size;
    var end = current * size - 1;
    var args = ['posts', start, end];
    //
    async.auto({
        get_ids: function(callback) {
            client.zrevrange(args, function(err, ids) {
                callback(err, ids);
            });
        },
        get_objs: ['get_ids', function(callback, results) {
            async.mapSeries(results.get_ids, function(id, cb) {
                client.hgetall('admin:' + id, function(err, obj) {
                    cb(err,obj);
                });
            }, function(err, results) {
                callback(err, results);
            });
        }],

        get_total: function(callback) {
            client.zcard('posts', function(err, total) {
                callback(err, total);
            })
        }
    }, function(err, results) {
        fn(err, results.get_ids, results.get_total);
    });
};

/*
 .delete (name, fn)
 return fn(err)
 * */
Post.delByid = function(id, fn) {
    async.auto({
        decr: function(callback) {
            client.decr('posts:count', function(err, id) {
                callback(err, id);
            });
        },
        del: function(callback) {
            client.del('post:' + id, function(err) {
                callback(err);
            });
        },
        del_from_list: function(callback) {
            client.zrem('posts', id, function(err) {
                callback(err);
            });
        }

    }, function(err) {
        fn(err);
    });
};


module.exports = Post;