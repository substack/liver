var http = require('http');
var through = require('through');
var browserify = require('browserify');

var liver = require('../../');
var level = require('level');
var db = level('/tmp/simplest.db', { encoding: 'json' });
db.batch(require('./data.json'));

var render = require('./render.js');

var server = http.createServer(function (req, res) {
    if (req.url === '/bundle.js') {
        return browserify('./browser.js').bundle().pipe(res);
    }
    var params = { start: 'cat!', end: 'cat!\uffff' };
    res.write('<html><body>'
        + '<div data-start="' + params.start + '" '
        + 'data-end="' + params.end + '">\n'
    );
    db.createReadStream(params).pipe(through(write, end)).pipe(res);
    
    function write (row) { this.queue(render(row).outerHTML + '\n') }
    function end () {
        this.queue('</div><script src="bundle.js"></script></body></html>\n');
        this.queue(null)
    }
});
server.listen(5000);

var shoe = require('shoe');
var sock = shoe(function (stream) { stream.pipe(liver(db)).pipe(stream) });
sock.install(server, '/sock');
