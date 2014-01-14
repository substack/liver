var http = require('http');
var fs = require('fs');
var ecstatic = require('ecstatic')(__dirname + '/static');
var hyperstream = require('hyperstream');

var multilevel = require('multilevel');
var level = require('level');
var db = level('/tmp/liver.db', { encoding: 'json' });

var bulk = require('bulk-require');
var parts = bulk(__dirname + '/parts', [ [ '*/data.js', db ], '*/*.js' ]);

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        readStream('index.html').pipe(hyperstream({
            '#content': parts.cats.data.list().pipe(parts.cats.render())
        })).pipe(res);
    }
    else ecstatic(req, res);
});
server.listen(5000);

var shoe = require('shoe');
var sock = shoe(function (stream) {
    stream.pipe(multilevel.server(db)).pipe(stream);
});
sock.install(server, '/sock');

function readStream (file) {
    return fs.createReadStream(__dirname + '/static/' + file);
}
