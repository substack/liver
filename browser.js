var inherits = require('inherits');
var multilevel = require('multilevel');
var Readable = require('stream').Readable;
var Duplex = require('stream').Duplex;
var manifest = require('./manifest.json');

module.exports = Liver;
inherits(Liver, Duplex);

function Liver (root, cb) {
    if (!(this instanceof Liver)) return new Liver(root, cb);
    var self = this;
    Duplex.call(this);
    
    if (typeof root === 'function') {
        cb = root;
        root = undefined;
    }
    if (!root) root = document;
    if (cb) this.on('feed', cb);
    
    this.db = multilevel.client(manifest);
    this.rpc = this.db.createRpcStream();
    if (!this.rpc._read) this.rpc = new Readable().wrap(this.rpc);
    this.rpc.on('finish', function () {
        self.push(null);
    });
    
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
        for (var i = 0; i < self.feeds.length; i++) {
            self.emit('feed', self.feeds[i]);
        }
    });
    
    this.feeds = [];
    for (var i = 0; i < this.ranges.length; i++) {
        var r = this.ranges[i];
        var feed = this.db.livefeed({ start: r.start, end: r.end });
        feed.start = r.start;
        feed.end = r.end;
        feed.element = r.element;
        feed.query = function (key) {
            return feed.element.querySelector('*[data-key="' + key + '"]');
        };
        this.feeds.push(feed);
    }
}

Liver.prototype.get = function () { this.db.get.apply(this.db, arguments) };
Liver.prototype.put = function () { this.db.put.apply(this.db, arguments) };
Liver.prototype.del = function () { this.db.del.apply(this.db, arguments) };
Liver.prototype.batch = function () { this.db.batch.apply(this.db, arguments) };

Liver.prototype._read = function () {
    var self = this;
    var chunk, times = 0;
    while ((chunk = this.rpc.read()) !== null) {
        this.push(chunk);
        times ++;
    }
    if (times === 0) this.rpc.once('readable', function () {
        self._read();
    });
};

Liver.prototype._write = function (buf, enc, next) {
    this.rpc.write(buf);
    next();
};

function scanRanges (root) {
    var startList = root.querySelectorAll('*[data-start]');
    var ranges = [];
    
    for (var i = 0; i < startList.length; i++) {
        var elem = startList[i];
        var start = elem.getAttribute('data-start');
        var end = elem.getAttribute('data-end');
        
        ranges.push({
            element: elem,
            start: start,
            end: end
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
