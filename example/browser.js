var liver = require('../');
var shoe = require('shoe');
var cats = require('./parts/cats/render.js');

var live = liver();
window.live = live;
live.on('feed', function (feed) {
    var type = feed.start.split('!')[0];
    if (type === 'cat') {
        feed.pipe(cats().appendTo(feed.element));
    }
});
live.pipe(shoe('/sock')).pipe(live);
