var liver = require('../../');
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
