var liver = require('../');
var shoe = require('shoe');
var cats = require('./parts/cats/render.js');

var live = liver();
live.on('feed', function (feed) {
    var type = feed.start.split('!')[0];
    if (type === 'cat') {
        feed.pipe(cats().sortTo(feed.element, function (a, b) {
            var la = Number(a.querySelector('.lives').textContent);
            var lb = Number(b.querySelector('.lives').textContent);
            return la < lb ? -1 : 1;
        }));
    }
});
live.pipe(shoe('/sock')).pipe(live);
