var liver = require('../');
var shoe = require('shoe');

var live = liver();
live.pipe(shoe('/sock')).pipe(live);

live.on('element', function (elem) {
    elem.addEventListener('click', function (ev) {
        console.log('CLICK');
    });
});

live.on('update', function () {
});
