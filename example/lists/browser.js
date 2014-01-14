var liver = require('../../');
var shoe = require('shoe');
var render = require('./render.js');

var live = liver();
live.on('feed', function (feed) {
    var r = feed.pipe(render());
    var prev;
    r.on('element', function (elem) {
        elem.addEventListener('click', function (ev) {
            if (prev) prev.classList.remove('active');
            elem.classList.add('active');
            prev = elem;
            
            active.textContent = elem.querySelector('.title').textContent;
            vote.classList.remove('hide');
        });
    });
    r.sortTo(feed.element, cmp);
    
    function cmp (a, b) {
        var xa = Number(a.querySelector('.score').textContent);
        var xb = Number(b.querySelector('.score').textContent);
        return xa > xb ? -1 : 1;
    }
});
live.pipe(shoe('/sock')).pipe(live);

var name = location.pathname.slice(1) || 'default';
var active = document.querySelector('#active');

var vote = document.querySelector('#vote');
vote.addEventListener('click', function (ev) {
    var key = 'item!' + name + '!' + active.textContent;
    live.get(key, function (err, value) {
        value.score += 5;
        live.put(key, value);
    });
});

var newItem = document.querySelector('#new');
newItem.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var title = this.elements.title.value;
    live.put('item!' + name + '!' + title, { title: title, score: 0 });
    this.elements.title.value = '';
});
