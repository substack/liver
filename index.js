var multilevel = require('multilevel');
var liveFeed = require('level-livefeed');

module.exports = function (db, opts) {
    db.methods = db.methods || {};
    
    db.methods.livefeed = { type: 'readable' };
    db.livefeed = function (opts) {
        return liveFeed(db, opts);
    };
    return multilevel.server(db, opts);
};
