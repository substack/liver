var hyperspace = require('hyperspace');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/cat.html', 'utf8');

module.exports = function () {
    return hyperspace(html, { key: 'data-key' }, function (row) {
        return {
            '.name': row.value.name,
            '.lives': row.value.lives
        };
    });
};
