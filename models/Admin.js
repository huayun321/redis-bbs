var client = require('./conn').client;

function Admin(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
};

Admin.prototype.save = function(fn) {
    if (this.id) {
        this.update(fn);
    } else {
        var admin = this;
        client.incr('admins:count', function(err, id) {
            if(err) return fn(err);
            admin.id = id;
            this.addToList(function(err) {
                if(err) return fn(err);
                this.update(fn);
            });
        })
    }
}

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
        var list = [];

        for(var i= 0; i<results.length; i ++) {
            client.hgetall('admin:' + results[i], function(err, admin) {
                if(err) return fn(err);
                list.push(admin);
            });
        }

        fn(null, list);
    })
}

module.exports = Admin;