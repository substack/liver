var level = require('level');
var db = level('/tmp/liver.db', { encoding: 'json' });

db.put('cat!whiskers', { name: 'Whiskers', lives: 6 });
db.put('cat!athena', { name: '', lives: 9 });
db.put('cat!sir-theodore-tibblesworth', { name: 'Sir Theodore Tibblesworth', lives: 2 });
db.put('cat!rex', { name: 'Rex', lives: 5 });
