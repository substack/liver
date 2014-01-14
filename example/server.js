var http = require('http');
var fs = require('fs');
var ecstatic = require('ecstatic')(__dirname + '/static');
var hyperstream = require('hyperstream');

var liver = require('../');
var level = require('level');
var db = level('/tmp/liver.db', { encoding: 'json' });
require('./populate.js')(db);

var bulk = require('bulk-require');
var parts = bulk(__dirname + '/parts', [ [ '*/data.js', db ], '*/*.js' ]);

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        var ls = parts.cats.data.list();
        var hs = hyperstream({
            '#content': {
                _html: ls.pipe(parts.cats.render()),
                'data-start': ls._options.start,
                'data-end': ls._options.end
            }
        });
        readStream('index.html').pipe(hs).pipe(res);
    }
    else ecstatic(req, res);
});
server.listen(5000);

var shoe = require('shoe');
var sock = shoe(function (stream) {
    stream.pipe(liver(db)).pipe(stream);
});
sock.install(server, '/sock');

function readStream (file) {
    return fs.createReadStream(__dirname + '/static/' + file);
}
