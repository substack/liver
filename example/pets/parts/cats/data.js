exports.get = function (db, name, cb) {
    var key = 'cat!' + name;
    
    db.get(key, function (err, value) {
        cb(err, err || { key: key, value: value });
    });
};

exports.list = function (db) {
    return db.createReadStream({ start: 'cat!', end: 'cat!\uffff' });
};
