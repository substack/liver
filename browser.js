var inherits = require('inherits');
var multilevel = require('multilevel');
var Readable = require('stream').Readable;
var Duplex = require('stream').Duplex;
var manifest = require('./manifest.json');

module.exports = Liver;
inherits(Liver, Duplex);

function Liver (root) {
    if (!(this instanceof Liver)) return new Liver(root);
    var self = this;
    Duplex.call(this);
    
    if (!root) root = document;
    
    this.db = multilevel.client(manifest);
    this.rpc = this.db.createRpcStream();
    if (!this.rpc._read) this.rpc = new Readable().wrap(this.rpc);
    
    this.ranges = scanRanges(root);
    this.keys = scanKeys(root);
    var keys = objectKeys(this.keys);
    
    process.nextTick(function () {
        for (var i = 0; i < keys.length; i++) {
            var xs = self.keys[keys[i]];
            for (var j = 0; j < xs.length; j++) {
                self.emit('element', xs[j].element);
            }
        }
    });
}

Liver.prototype.get = function () { this.db.get.apply(this.db, arguments) };
Liver.prototype.put = function () { this.db.put.apply(this.db, arguments) };
Liver.prototype.del = function () { this.db.del.apply(this.db, arguments) };
Liver.prototype.batch = function () { this.db.batch.apply(this.db, arguments) };

Liver.prototype._read = function (n) {
    this.rpc._read(n);
};

Liver.prototype._write = function (buf, enc, next) {
    this.rpc._write(buf, enc, next);
};

function scanRanges (root) {
    var startList = root.querySelectorAll('*[data-start]');
    var ranges = [];
    
    for (var i = 0; i < startList.length; i++) {
        var elem = startList[i];
        var start = elem.getAttribute('data-start');
        var end = elem.getAttribute('data-end');
        
        var keyList = elem.querySelectorAll('*[data-key]');
        var ks = [];
        for (var i = 0; i < keyList.length; i++) {
            var elem = keyList[i];
            var key = elem.getAttribute('data-key');
            ks.push({ element: key });
        }
        
        ranges.push({
            element: elem,
            start: start,
            end: end,
            keys: ks
        });
    }
    return ranges;
}

function scanKeys (root) {
    var keys = {};
    var keyList = root.querySelectorAll('*[data-key]');
    for (var i = 0; i < keyList.length; i++) {
        var elem = keyList[i];
        var key = elem.getAttribute('data-key');
        
        if (!keys[key]) keys[key] = [];
        keys[key].push({ element: elem });
    }
    return keys;
}

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};
