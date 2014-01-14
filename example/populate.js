var names = [ 'Whiskers', 'Athena', 'Sir Theodore Tibblesworth', 'Rex' ];
function keyOf (name) { return name.toLowerCase().replace(/\W+/g, '-') }

module.exports = function (db) {
    setInterval(function () {
        var lives = Math.floor(Math.random() * 9 + 1);
        var name = names[Math.floor(Math.random() * names.length)];
        db.put('cat!' + keyOf(name), { name: name, lives: lives });
    }, 1000);
};
