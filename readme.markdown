# liver

update page markup when a leveldb database changes

# example

First render some html into a container element with `data-start` and `data-end`
attributes with the `db.createReadStream()` `start` and `end` parameters that
you want to live update:

``` js
var http = require('http');
var through = require('through');
var browserify = require('browserify');

var liver = require('liver');
var level = require('level');
var db = level('/tmp/simplest.db', { encoding: 'json' });
db.batch(require('./data.json'));

var render = require('./render.js');

var server = http.createServer(function (req, res) {
    if (req.url === '/bundle.js') {
        return browserify('browser.js').bundle().pipe(res);
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
```

Next write a rendering function to share between node and the browser that will
take a `row` from the database as input and produce html elements as output:

``` js
var h = require('hyperscript');

module.exports = function (row) {
    return h('div.cat', { 'data-key': row.key }, row.value.name);
};
```

At this point we can get some html out of our server and rendering function:

```
$ curl localhost:5000
<html><body><div data-start="cat!" data-end="cat!￿">
<div class="cat" data-key="cat!athena">Athena</div>
<div class="cat" data-key="cat!mr-whiskers">Mr. Whiskers</div>
<div class="cat" data-key="cat!rex">Rex</div>
<div class="cat" data-key="cat!sir-tibbles">Sir Tibbles</div>
</div><script src="bundle.js"></script></body></html>
```

Finally we can wire up a `liver` instance that will emit a `'feed`' event for
every `data-{start,end}` container element found on the page. `liver` sets up a
[level-livefeed](https://npmjs.org/package/level-livefeed) using
[multilevel](https://npmjs.org/package/multilevel). Here's the browser code:

``` js
var liver = require('liver');
var shoe = require('shoe');
var render = require('./render.js');

var live = liver(function (feed) {
    feed.on('data', function (row) {
        var ex = feed.query(row.key);
        if (ex) feed.element.removeChild(ex);
        if (row.type !== 'del') {
            feed.element.appendChild(render(row));
        }
    });
});
live.pipe(shoe('/sock')).pipe(live);

window.live = live; // so you can debug in your browser
```

Now open multiple browser windows up to `http://localhost:5000` and in a
debugger, type:

```
live.put('cat!cylon', { name: 'Cylon' })
```

to create a new cat entry. Do:

```
live.put('cat!mr-whiskers', { name: 'MR WHISK' })
```

to update an existing entry. Finally you can do:

```
live.del('cat!cylon')
```

to delete an existing entry. All the connected browsers automatically update and
the changes are persisted into leveldb! Your server can also write to the
database with ordinary `db.put()` calls and browsers will see the updates
automatically.

The API is the same as
[leveldown](https://npmjs.org/package/leveldown) thanks to
[multilevel](https://npmjs.org/package/multilevel).

Check out the [lists/ example](example/lists) for an example of using
[hyperstream](https://npmjs.org/package/hyperstream) to handle the shared
rendering in a different way.

# methods

``` js
var liver = require('liver')
```

## server methods

### liver(db, opts)

Return a duplex [multilevel](https://npmjs.org/package/multilevel) server rpc
stream to wire up to the browser over a web socket.

The `opts` are passed directly to
[multilevel](https://npmjs.org/package/multilevel).

You can use the `opts` parameter to configure
[authentication and access](https://github.com/juliangruber/multilevel#authentication)
functions.

## browser mthods

### var live = liver(rootElement=document, cb)

The `rootElement` specifies where elements with `data-start` and `data-end`
attributes will be searched for. `rootElement` defaults to `document` if not
provided.

If `cb(feed)` is given, it will be set up as a listener on the `'feed'` event.

### live.get(), live.put(), live.del(), live.createReadStream()

These methods are passed through from the
[multilevel](http://npmjs.org/package/multilevel) handle.

## browser events

### live.on('feed', function (feed) {})

When an element with a `data-start` attribute is found on the page, this event
fires with `feed`, a readable
[livefeed](https://npmjs.org/package/level-livefeed) stream that outputs live
row data for every key in the range given by `data-start` through `data-end`.

feed also contains:

* `feed.start` - the start key
* `feed.end` - the end key
* `feed.element` - the container element with the `data-*` attributes
* `feed.query(key)` - return the `data-key` element for the string `key`

# install

With [npm](https://npmjs.org) do:

```
npm install liver
```

# license

MIT
