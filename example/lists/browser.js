var liver = require('../../');
var shoe = require('shoe');
var render = require('./render.js');
var observe = require('observ');

var live = liver();
live.on('feed', function (feed) {
    var prev, r = feed.pipe(render());
    r.on('element', function (elem) {
        elem.addEventListener('click', function (ev) {
            if (prev) prev.classList.remove('active');
            prev = elem;
            elem.classList.add('active');
            active.set(elem.querySelector('.title').textContent);
        });
    });
    r.sortTo(feed.element, '.score');
});
live.pipe(shoe('/sock')).pipe(live);

var name = location.pathname.slice(1) || 'default';
var active = observe();
active(function (txt) {
    document.querySelector('#active').textContent = txt;
    vote.classList.remove('hide');
});

var vote = document.querySelector('#vote');
vote.addEventListener('click', function (ev) {
    var key = name + '!' + active();
    live.get(key, function (err, value) {
        value.score += 5;
        live.put(key, value);
    });
});

var newItem = document.querySelector('#new');
newItem.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var title = this.elements.title.value;
    live.put(name + '!' + title, { title: title, score: 0 });
    this.elements.title.value = '';
});
