var hyperspace = require('hyperspace');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/cat.html', 'utf8');

module.exports = function () {
    return hyperspace(html, function (row) {
        return {
            '.row': { 'data-key': row.key },
            '.name': row.value.name,
            '.lives': row.value.lives
        };
    });
};
